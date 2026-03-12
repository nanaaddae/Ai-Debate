from groq import Groq
from app.config import settings
import json
import re


class QualityScorer:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = "llama-3.3-70b-versatile"

    async def score_argument(self, argument_text: str, debate_topic: str) -> dict:
        """
        Score an argument on multiple dimensions
        Returns dict with scores for: logic, evidence, relevance, persuasiveness
        """

        prompt = f"""You are an expert debate judge. Evaluate the following argument on a debate topic.

Debate Topic: {debate_topic}

Argument: {argument_text}

Rate this argument on the following criteria (0-100 scale):

1. LOGIC (0-100): How logically sound and coherent is the reasoning?
   - Are there logical fallacies?
   - Does the conclusion follow from the premises?
   - Is the reasoning clear and consistent?

2. EVIDENCE (0-100): How well-supported is the argument with facts, data, or examples?
   - Are claims backed up with evidence?
   - Are examples concrete and relevant?
   - Is there citation of credible sources?

3. RELEVANCE (0-100): How relevant is this argument to the debate topic?
   - Does it directly address the topic?
   - Is it on-topic throughout?
   - Does it avoid tangents?

4. PERSUASIVENESS (0-100): How convincing is this argument overall?
   - Would this change someone's mind?
   - Is the language effective?
   - Does it anticipate counter-arguments?

IMPORTANT: Respond ONLY with a valid JSON object in this exact format, with no additional text:
{{
  "logic": <number 0-100>,
  "evidence": <number 0-100>,
  "relevance": <number 0-100>,
  "persuasiveness": <number 0-100>,
  "explanation": "<brief 1-2 sentence explanation>"
}}"""

        try:
            response = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=self.model,
                temperature=0.3,  # Lower temperature for more consistent scoring
                max_tokens=300
            )

            content = response.choices[0].message.content.strip()

            # Try to extract JSON from response
            # Remove markdown code blocks if present
            content = re.sub(r'```json\s*|\s*```', '', content)

            # Parse JSON
            scores = json.loads(content)

            # Validate scores are in range
            for key in ['logic', 'evidence', 'relevance', 'persuasiveness']:
                if key not in scores:
                    scores[key] = 50  # Default if missing
                else:
                    # Ensure 0-100 range
                    scores[key] = max(0, min(100, int(scores[key])))

            # Calculate overall score (weighted average)
            overall = int(
                (scores['logic'] * 0.3) +
                (scores['evidence'] * 0.25) +
                (scores['relevance'] * 0.25) +
                (scores['persuasiveness'] * 0.2)
            )

            return {
                'logic': scores['logic'],
                'evidence': scores['evidence'],
                'relevance': scores['relevance'],
                'persuasiveness': scores['persuasiveness'],
                'overall': overall,
                'explanation': scores.get('explanation', 'No explanation provided')
            }

        except json.JSONDecodeError as e:
            print(f"Failed to parse AI response as JSON: {content}")
            # Return default scores if AI response is malformed
            return {
                'logic': 50,
                'evidence': 50,
                'relevance': 50,
                'persuasiveness': 50,
                'overall': 50,
                'explanation': 'Unable to score - AI response format error'
            }
        except Exception as e:
            print(f"Error scoring argument: {e}")
            return {
                'logic': 50,
                'evidence': 50,
                'relevance': 50,
                'persuasiveness': 50,
                'overall': 50,
                'explanation': 'Unable to score - error occurred'
            }


quality_scorer = QualityScorer()