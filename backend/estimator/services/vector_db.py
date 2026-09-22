import math
import re
from collections import Counter

class VectorDBStore:
    """
    In-Memory Vector Database & Semantic Similarity Retriever for ConstructAI.
    Stores vectorized Knowledge Base documents (IS 456, NBC 2016, Vastu, City Rates)
    and retrieves top matching context for Groq Llama 3 70B RAG queries.
    """
    def __init__(self):
        self.documents = [
            {
                "id": "is456-rcc-standards",
                "title": "IS 456:2000 Plain and Reinforced Concrete Code",
                "content": (
                    "IS 456 Code Standards for Indian RCC Construction:\n"
                    "• Minimum Grade of Concrete for RCC Slabs/Columns: M20 (1:1.5:3) or M25 for coastal regions.\n"
                    "• Steel Rebar Standard: Fe-500D / Fe-550D TMT bars (Tata Tiscon / JSW Neosteel).\n"
                    "• Steel Requirement Ratio: 3.5 to 4.2 Tons per 1,000 sq ft built-up area.\n"
                    "• Cement Requirement: 0.40 to 0.45 Bags (50kg) per sq ft of built-up area.\n"
                    "• Column Clear Cover: 40mm minimum cover for corrosion resistance."
                )
            },
            {
                "id": "nbc2016-vastu-rules",
                "title": "NBC 2016 & Vastu Shastra Structural Guidelines",
                "content": (
                    "NBC 2016 & Vastu Shastra Principles for Floor Plans:\n"
                    "• Main Entrance: North, North-East, or East orientation for auspicious light and energy flow.\n"
                    "• Kitchen Location: South-East (Agni corner) with cooking counter facing East.\n"
                    "• Master Bedroom: South-West corner for stability and privacy.\n"
                    "• Staircase Location: South or West orientation, rotating clockwise.\n"
                    "• Setback Requirements: Minimum 3 ft to 5 ft clear setback from plot boundaries as per NBC 2016."
                )
            },
            {
                "id": "city-rates-2026",
                "title": "Indian Regional Turnkey Rates & Material Price Index 2026",
                "content": (
                    "2026 Civil Engineering Turnkey Construction Market Rates:\n"
                    "• Mumbai MMR: ₹ 1,850 - ₹ 2,250 / sq ft (High labor & sand transit costs).\n"
                    "• Delhi NCR / Gurgaon: ₹ 1,750 - ₹ 2,100 / sq ft.\n"
                    "• Bengaluru / Karnataka: ₹ 1,780 - ₹ 2,150 / sq ft.\n"
                    "• Hyderabad / Telangana: ₹ 1,700 - ₹ 2,050 / sq ft.\n"
                    "• Labour Cost Share: Skilled masonry & labor accounts for 30% of total turnkey budget.\n"
                    "• Material Cost Share: Cement, steel, sand & aggregate account for 55% of turnkey budget."
                )
            },
            {
                "id": "plumbing-electrical-rates",
                "title": "Concealed Plumbing & Electrical Wiring Rate Card",
                "content": (
                    "Plumbing & Electrical Engineering Specifications:\n"
                    "• Concealed CPVC/UPVC Plumbing: ₹ 180 / sq ft (Jaquar / Kohler fixture integration).\n"
                    "• Concealed Copper Wiring: ₹ 160 / sq ft using Polycab / Finolex Flame-Retardant FR Wires.\n"
                    "• Distribution Board (DB): Schneider / Havells MCBs with ELCB earth leakage protection.\n"
                    "• Terrace Hydro-Testing: 48-hour static water pressure test for zero leakage assurance."
                )
            },
            {
                "id": "finishing-rates-material",
                "title": "Premium Turnkey Finishing & Flooring Specifications",
                "content": (
                    "Finishing Materials & Quotation Specs:\n"
                    "• Vitrified Tiles: 4x2 ft double-charged tiles (Kajaria / Somany) @ ₹ 85 - ₹ 120 / sq ft.\n"
                    "• Italian Marble Flooring: Bottochino / Dyna @ ₹ 350 - ₹ 550 / sq ft.\n"
                    "• Painting: 1 Coat Primer + 2 Coats Acrylic Emulsion (Asian Paints Royale / Berger Silk).\n"
                    "• AAC Blocks: 600x200x150mm lightweight autoclave blocks replacing traditional clay bricks."
                )
            }
        ]

        # Vectorize documents
        self.doc_vectors = []
        for doc in self.documents:
            words = self._tokenize(doc["content"])
            vec = Counter(words)
            self.doc_vectors.append((doc, vec))

    def _tokenize(self, text):
        return re.findall(r'\w+', text.lower())

    def _cosine_similarity(self, vec1, vec2):
        intersection = set(vec1.keys()) & set(vec2.keys())
        numerator = sum([vec1[x] * vec2[x] for x in intersection])
        sum1 = sum([vec1[x]**2 for x in vec1.keys()])
        sum2 = sum([vec2[x]**2 for x in vec2.keys()])
        denominator = math.sqrt(sum1) * math.sqrt(sum2)
        if not denominator:
            return 0.0
        return float(numerator) / denominator

    def search(self, query, top_k=2):
        query_words = self._tokenize(query)
        query_vec = Counter(query_words)

        results = []
        for doc, doc_vec in self.doc_vectors:
            score = self._cosine_similarity(query_vec, doc_vec)
            results.append((score, doc))

        results.sort(key=lambda x: x[0], reverse=True)
        return [doc for score, doc in results[:top_k]]

# Global Vector DB Instance
vector_db_instance = VectorDBStore()

def query_vector_db_context(query, top_k=2):
    """Retrieves top matching Vector DB knowledge documents for Groq AI RAG."""
    matched_docs = vector_db_instance.search(query, top_k=top_k)
    context_str = "\n\n".join([f"--- VECTOR DB RETRIEVED CONTEXT [{d['title']}] ---\n{d['content']}" for d in matched_docs])
    return context_str
