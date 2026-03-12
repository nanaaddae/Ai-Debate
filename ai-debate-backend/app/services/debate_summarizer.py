from groq import Groq
from app.config import settings
import json
import re


class DebateSummarizer:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = "llama-3.3-70b-versatile"

    async def generate_debate_summary(
            self,
            debate_topic: str,
            ai_pro_argument: str,
            ai_con_argument: str,
            user_pro_arguments: list,
            user_con_arguments: list,
            pro_votes: int,
            con_votes: int
    ) -> dict:
        """
        Generate a comprehensive summary of the debate
        Returns: {
            "summary": "...",
            "winner": "pro" | "con" | "tie",
            "key_points_pro": [...],
            "key_points_con": [...],
            "common_ground": "..."
        }
        """

        # Compile all arguments
        all_pro_args = [ai_pro_argument] + [arg['content'] for arg in user_pro_arguments]
        all_con_args = [ai_con_argument] + [arg['content'] for arg in user_con_arguments]

        pro_args_text = "\n\n".join([f"PRO Argument {i + 1}: {arg}" for i, arg in enumerate(all_pro_args)])
        con_args_text = "\n\n".join([f"CON Argument {i + 1}: {arg}" for i, arg in enumerate(all_con_args)])

        prompt = f"""You are an expert debate judge analyzing a completed debate.

DEBATE TOPIC: {debate_topic}

VOTING RESULTS:
- PRO votes: {pro_votes}
- CON votes: {con_votes}

PRO ARGUMENTS:
{pro_args_text}

CON ARGUMENTS:
{con_args_text}

Analyze this debate and provide a comprehensive summary. Consider:
1. The quality of arguments (logic, evidence, persuasiveness)
2. The voting results
3. Key points made by each side
4. Any common ground or areas of agreement
5. Which side presented the stronger case overall

Respond ONLY with a valid JSON object in this exact format:
{{
  "summary": "<3-4 paragraph neutral summary of the entire debate>",
  "winner": "<pro|con|tie>",
  "winner_reasoning": "<1-2 sentences explaining why this side won or why it's a tie>",
  "key_points_pro": ["<point 1>", "<point 2>", "<point 3>"],
  "key_points_con": ["<point 1>", "<point 2>", "<point 3>"],
  "common_ground": "<1-2 sentences about any areas where both sides agree>"
}}

Be objective and fair. Base the winner on argument quality, not just vote count."""

        try:
            response = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=self.model,
                temperature=0.4,  # Lower temp for more consistent summaries
                max_tokens=1500
            )

            content = response.choices[0].message.content.strip()

            # Clean up response
            content = re.sub(r'```json\s*|\s*```', '', content)

            # Parse JSON
            result = json.loads(content)

            # Validate required fields
            required_fields = ['summary', 'winner', 'winner_reasoning', 'key_points_pro', 'key_points_con',
                               'common_ground']
            for field in required_fields:
                if field not in result:
                    result[field] = "" if field != 'winner' else "tie"

            # Validate winner value
            if result['winner'] not in ['pro', 'con', 'tie']:
                result['winner'] = 'tie'

            return result

        except json.JSONDecodeError as e:
            print(f"Failed to parse AI summary response: {content}")
            return {
                "summary": "Unable to generate summary - AI response format error.",
                "winner": "tie",
                "winner_reasoning": "Could not determine winner.",
                "key_points_pro": [],
                "key_points_con": [],
                "common_ground": "Unable to analyze."
            }
        except Exception as e:
            print(f"Error generating debate summary: {e}")
            return {
                "summary": "Unable to generate summary due to an error.",
                "winner": "tie",
                "winner_reasoning": "Could not determine winner.",
                "key_points_pro": [],
                "key_points_con": [],
                "common_ground": "Unable to analyze."
            }


debate_summarizer = DebateSummarizer()