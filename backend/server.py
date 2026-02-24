"""
OpenGradient SDK Backend — FastAPI server bridging the quiz frontend
to the OpenGradient Python SDK for TEE-verified AI feedback.

Run:  python server.py
Env:  OG_PRIVATE_KEY=0x...  (optional — falls back to mock mode)
"""

import json
import os
import traceback
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# ── Try to import OpenGradient ────────────────────────────────────────────
OG_AVAILABLE = False
og = None
og_client = None

try:
    import opengradient as _og

    private_key = os.environ.get("OG_PRIVATE_KEY")
    if private_key:
        og = _og
        og_client = og.init(private_key=private_key)
        # Approve OPG spending (idempotent)
        try:
            og_client.llm.ensure_opg_approval(opg_amount=5)
        except Exception as e:
            print(f"[OG] OPG approval warning: {e}")
        OG_AVAILABLE = True
        print("[OG] OpenGradient SDK initialized successfully.")
    else:
        print("[OG] OG_PRIVATE_KEY not set — running in MOCK mode.")
except ImportError:
    print("[OG] opengradient package not found — running in MOCK mode.")
except Exception as e:
    print(f"[OG] Init error: {e} — running in MOCK mode.")

# ── FastAPI App ───────────────────────────────────────────────────────────
app = FastAPI(title="OpenGradient Quiz Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response schemas ────────────────────────────────────────────
class QuestionResult(BaseModel):
    question: str
    userAnswer: str
    correctAnswer: str
    isCorrect: bool
    category: str
    difficulty: str


class AnalyzeRequest(BaseModel):
    username: str
    score: int
    total: int
    percentage: int
    rank: str
    results: list[QuestionResult]


class AnalyzeResponse(BaseModel):
    analysis: str
    transactionHash: Optional[str] = None
    verified: bool = False
    model: str = "mock"


class SettleRequest(BaseModel):
    username: str
    score: int
    total: int
    percentage: int


class SettleResponse(BaseModel):
    transactionHash: Optional[str] = None
    settled: bool = False


# ── Mock AI Analysis ─────────────────────────────────────────────────────
def generate_mock_analysis(req: AnalyzeRequest) -> str:
    wrong = [r for r in req.results if not r.isCorrect]
    correct = [r for r in req.results if r.isCorrect]

    categories_wrong = {}
    for r in wrong:
        categories_wrong.setdefault(r.category, []).append(r)

    analysis = f"## Quiz Analysis for {req.username}\n\n"
    analysis += f"You scored **{req.score}/{req.total}** ({req.percentage}%) — Rank: **{req.rank}**\n\n"

    if req.percentage >= 80:
        analysis += "🌟 **Excellent performance!** You demonstrate strong knowledge of the OpenGradient ecosystem.\n\n"
    elif req.percentage >= 60:
        analysis += "👍 **Good effort!** You have a solid foundation but there's room to deepen your understanding.\n\n"
    else:
        analysis += "📚 **Keep learning!** Review the OpenGradient docs to strengthen your knowledge.\n\n"

    if wrong:
        analysis += "### Areas to Review\n\n"
        for cat, items in categories_wrong.items():
            analysis += f"- **{cat.title()}**: {len(items)} question(s) missed\n"
        analysis += "\n"

    if correct:
        strong_cats = set(r.category for r in correct)
        analysis += "### Strengths\n\n"
        for cat in strong_cats:
            count = sum(1 for r in correct if r.category == cat)
            analysis += f"- **{cat.title()}**: {count} correct\n"

    return analysis


# ── Endpoints ────────────────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    return {"status": "ok", "ogAvailable": OG_AVAILABLE}


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_quiz(req: AnalyzeRequest):
    """
    Analyze quiz results using OpenGradient's TEE-verified LLM.
    Falls back to mock analysis if SDK not available.
    """
    if OG_AVAILABLE and og and og_client:
        try:
            # Build a summary of the quiz results for the LLM
            results_summary = "\n".join(
                f"Q: {r.question}\n"
                f"  User answered: {r.userAnswer} ({'✓ correct' if r.isCorrect else '✗ wrong — correct: ' + r.correctAnswer})\n"
                f"  Category: {r.category} | Difficulty: {r.difficulty}"
                for r in req.results
            )

            prompt = (
                f"You are an expert quiz coach for the OpenGradient protocol ecosystem. "
                f"A user named '{req.username}' just completed a quiz.\n\n"
                f"Score: {req.score}/{req.total} ({req.percentage}%)\n"
                f"Rank: {req.rank}\n\n"
                f"Here are their results:\n{results_summary}\n\n"
                f"Provide a concise, encouraging analysis in markdown format:\n"
                f"1. Overall assessment (2-3 sentences)\n"
                f"2. Knowledge gaps (list the specific topics they got wrong and what to study)\n"
                f"3. Strengths (what they know well)\n"
                f"4. One specific recommendation to improve\n\n"
                f"Keep it under 250 words. Be specific to OpenGradient concepts."
            )

            completion = og_client.llm.chat(
                model=og.TEE_LLM.GPT_4O,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500,
                x402_settlement_mode=og.x402SettlementMode.SETTLE_BATCH,
            )

            analysis_text = completion.chat_output.get("content", "")
            tx_hash = getattr(completion, "transaction_hash", None)

            return AnalyzeResponse(
                analysis=analysis_text,
                transactionHash=tx_hash,
                verified=True,
                model="GPT-4o (TEE-verified)",
            )
        except Exception as e:
            print(f"[OG] LLM error, falling back to mock: {e}")
            traceback.print_exc()

    # Fallback: mock analysis
    return AnalyzeResponse(
        analysis=generate_mock_analysis(req),
        transactionHash=None,
        verified=False,
        model="mock",
    )


@app.post("/api/settle-score", response_model=SettleResponse)
async def settle_score(req: SettleRequest):
    """
    Record quiz score on-chain via OpenGradient AlphaSense.
    Returns transaction hash for verifiable proof-of-score.
    """
    if OG_AVAILABLE and og and og_client:
        try:
            # Use a simple on-chain model call to record the score
            # The input data itself serves as the on-chain record
            result = og_client.alpha.infer(
                model_cid="QmScore",  # placeholder — would use real model CID
                inference_mode=og.InferenceMode.VANILLA,
                model_input={
                    "username": req.username,
                    "score": float(req.score),
                    "total": float(req.total),
                    "percentage": float(req.percentage),
                },
            )
            return SettleResponse(
                transactionHash=result.transaction_hash,
                settled=True,
            )
        except Exception as e:
            print(f"[OG] Settlement error: {e}")

    return SettleResponse(transactionHash=None, settled=False)


# ── Run ──────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
