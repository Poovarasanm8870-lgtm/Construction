import os
import sys
import django
import uuid

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'constructai.settings')
django.setup()

from estimator.services.chatbot_engine import process_chat_message
from estimator.models import LabourRate, Material

def run_tests():
    print("\n==================================================")
    print("MANDATORY TEST SUITE: 15 SPECIFIC SECTION 29 SCENARIOS")
    print("==================================================\n")

    # TEST 1: "What is Fe500?" -> Fe500 explanation. NOT house estimate. NOT location="What is Fe500".
    s1_id = "sess_" + str(uuid.uuid4())[:8]
    r1 = process_chat_message(s1_id, "What is Fe500?")
    print(f"TEST 1 ('What is Fe500?'): type={r1.get('type')}, state={r1.get('session_state')}")
    assert r1.get('type') == 'text' and 'Fe500' in r1.get('message', '') and r1.get('session_state') == 'START'

    # TEST 2: "What is Fe550?" -> Fe550 explanation.
    r2 = process_chat_message(s1_id, "What is Fe550?")
    print(f"TEST 2 ('What is Fe550?'): type={r2.get('type')}, state={r2.get('session_state')}")
    assert r2.get('type') == 'text' and 'Fe550' in r2.get('message', '')

    # TEST 3: "What is the difference between Fe500 and Fe550?" -> Comparison.
    r3 = process_chat_message(s1_id, "What is the difference between Fe500 and Fe550?")
    print(f"TEST 3 ('Fe500 vs Fe550'): type={r3.get('type')}")
    assert r3.get('type') == 'text' and 'Fe500' in r3.get('message', '') and 'Fe550' in r3.get('message', '')

    # TEST 4: "I want to build a house" -> ask for square feet.
    s4_id = "sess_" + str(uuid.uuid4())[:8]
    r4 = process_chat_message(s4_id, "I want to build a house")
    print(f"TEST 4 ('I want to build a house'): type={r4.get('type')}, state={r4.get('session_state')}")
    assert r4.get('type') == 'sqft_request' and r4.get('session_state') == 'WAITING_FOR_SQFT'

    # TEST 5: "I want to build a 1500 sq ft house" -> ask only for location.
    s5_id = "sess_" + str(uuid.uuid4())[:8]
    r5 = process_chat_message(s5_id, "I want to build a 1500 sq ft house")
    print(f"TEST 5 ('I want to build a 1500 sq ft house'): type={r5.get('type')}, state={r5.get('session_state')}")
    assert r5.get('type') == 'location_request' and r5.get('session_state') == 'WAITING_FOR_LOCATION'

    # TEST 6: "I want to build a 1500 sq ft house in Tenkasi" -> show cement selection.
    s6_id = "sess_" + str(uuid.uuid4())[:8]
    r6 = process_chat_message(s6_id, "I want to build a 1500 sq ft house in Tenkasi")
    print(f"TEST 6 ('Combined input 1500 sq ft Tenkasi'): type={r6.get('type')}, state={r6.get('session_state')}")
    assert r6.get('type') == 'cement_selection' and r6.get('session_state') == 'CEMENT_SELECTION'

    # TEST 7: Select UltraTech -> show steel cards.
    r7 = process_chat_message(s6_id, "UltraTech")
    print(f"TEST 7 ('Select UltraTech'): type={r7.get('type')}, state={r7.get('session_state')}")
    assert r7.get('type') == 'steel_selection' and r7.get('session_state') == 'STEEL_SELECTION'

    # TEST 8: Select Tata Tiscon -> ask worker count.
    r8 = process_chat_message(s6_id, "Tata Tiscon")
    print(f"TEST 8 ('Select Tata Tiscon'): type={r8.get('type')}, state={r8.get('session_state')}")
    assert r8.get('type') == 'workforce_selection' and r8.get('session_state') == 'WORKFORCE_SELECTION'

    # TEST 9: Select 8 workers -> show Economy / Standard / Premium cards.
    r9 = process_chat_message(s6_id, "8 workers")
    print(f"TEST 9 ('Select 8 workers'): type={r9.get('type')}, packages count={len(r9.get('packages', []))}")
    assert r9.get('type') == 'package_selection' and len(r9.get('packages')) == 3

    # TEST 10: Select Standard -> show Standard package confirmation.
    r10 = process_chat_message(s6_id, "Select Standard")
    print(f"TEST 10 ('Select Standard'): type={r10.get('type')}, state={r10.get('session_state')}")
    assert r10.get('type') == 'confirmation' and r10.get('selected_package', {}).get('id') == 'standard'

    # TEST 11: Click Confirm Package -> show final estimate.
    r11 = process_chat_message(s6_id, "Confirm Package")
    print(f"TEST 11 ('Confirm Package'): type={r11.get('type')}, is_confirmed={r11.get('is_confirmed')}")
    assert r11.get('type') == 'text' and r11.get('is_confirmed') is True

    # TEST 12: Click Start New Estimate -> old state cleared, asks sqft again.
    r12 = process_chat_message(s6_id, "I want to build a house")
    print(f"TEST 12 ('Start New Estimate'): type={r12.get('type')}, state={r12.get('session_state')}")
    assert r12.get('type') == 'sqft_request' and r12.get('session_state') == 'WAITING_FOR_SQFT'

    # TEST 13: Ask "What is Fe500?" after completed estimate -> answers Fe500, does not reuse estimate.
    r13 = process_chat_message(s6_id, "What is Fe500?")
    print(f"TEST 13 ('Fe500 question during WAITING_FOR_SQFT'): type={r13.get('type')}")
    assert r13.get('type') == 'text' and 'Fe500' in r13.get('message', '')

    # TEST 14: Ask "What is PPC cement?" -> PPC explanation, NOT house estimate.
    r14 = process_chat_message(str(uuid.uuid4())[:8], "What is PPC cement?")
    print(f"TEST 14 ('What is PPC cement?'): type={r14.get('type')}")
    assert r14.get('type') == 'text' and 'PPC' in r14.get('message', '')

    # TEST 15: Ask "What is Python?" -> construction-assistant fallback.
    r15 = process_chat_message(str(uuid.uuid4())[:8], "What is Python?")
    print(f"TEST 15 ('What is Python?'): type={r15.get('type')}")
    assert r15.get('type') == 'off_topic'

    print("\n==================================================")
    print("✅ ALL 15 SECTION 29 SCENARIO TESTS PASSED PERFECTLY!")
    print("==================================================\n")

if __name__ == '__main__':
    run_tests()
