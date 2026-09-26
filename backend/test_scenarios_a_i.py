import os
import sys
import django
import uuid

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'constructai.settings')
django.setup()

from estimator.services.chatbot_engine import process_chat_message
from estimator.models import ChatbotSession

def run_tests_a_i():
    print("\n==================================================")
    print("MANDATORY TEST SUITE: 9 USER-SPECIFIED SCENARIOS (A - I)")
    print("==================================================\n")

    # TEST A: Click Build a House -> 1500 -> Tenkasi -> EXPECTED: Cement selection cards. NOT "I am ConstructAI"
    sA = "sess_testA_" + str(uuid.uuid4())[:8]
    process_chat_message(sA, "Build a House")
    process_chat_message(sA, "1500")
    rA3 = process_chat_message(sA, "Tenkasi")
    print(f"TEST A ('Build a House -> 1500 -> Tenkasi'): type={rA3.get('type')}, state={rA3.get('session_state')}")
    assert rA3.get('type') == 'cement_selection' and rA3.get('session_state') == 'CEMENT_SELECTION', f"Test A failed: {rA3}"

    # TEST B: Build a House -> 1500 -> Tenkasi -> Select cement -> Select steel -> 6 -> EXPECTED: Economy / Standard / Premium cards. NOT "I am ConstructAI"
    sB = "sess_testB_" + str(uuid.uuid4())[:8]
    process_chat_message(sB, "Build a House")
    process_chat_message(sB, "1500")
    process_chat_message(sB, "Tenkasi")
    process_chat_message(sB, "UltraTech")
    process_chat_message(sB, "Tata Tiscon")
    rB6 = process_chat_message(sB, "6")
    print(f"TEST B ('Worker Count 6'): type={rB6.get('type')}, packages count={len(rB6.get('packages', []))}")
    assert rB6.get('type') == 'package_selection' and len(rB6.get('packages', [])) == 3, f"Test B failed: {rB6}"

    # TEST C: Ask "What is Fe500?" -> EXPECTED: Fe500 explanation. NOT house estimate.
    sC = "sess_testC_" + str(uuid.uuid4())[:8]
    rC = process_chat_message(sC, "What is Fe500?")
    print(f"TEST C ('What is Fe500?'): type={rC.get('type')}")
    assert rC.get('type') == 'text' and 'Fe500' in rC.get('message', ''), f"Test C failed: {rC}"

    # TEST D: Ask "What is Fe550?" -> EXPECTED: Fe550 explanation.
    sD = "sess_testD_" + str(uuid.uuid4())[:8]
    rD = process_chat_message(sD, "What is Fe550?")
    print(f"TEST D ('What is Fe550?'): type={rD.get('type')}")
    assert rD.get('type') == 'text' and 'Fe550' in rD.get('message', ''), f"Test D failed: {rD}"

    # TEST E: Ask "What is the difference between Fe500 and Fe550?" -> EXPECTED: Clear comparison.
    sE = "sess_testE_" + str(uuid.uuid4())[:8]
    rE = process_chat_message(sE, "What is the difference between Fe500 and Fe550?")
    print(f"TEST E ('Fe500 vs Fe550'): type={rE.get('type')}")
    assert rE.get('type') == 'text' and 'Fe500' in rE.get('message', '') and 'Fe550' in rE.get('message', ''), f"Test E failed: {rE}"

    # TEST F: Ask "How to fix ceiling leakage?" -> EXPECTED: Construction answer. NOT "I am ConstructAI"
    sF = "sess_testF_" + str(uuid.uuid4())[:8]
    rF = process_chat_message(sF, "How to fix ceiling leakage?")
    print(f"TEST F ('How to fix ceiling leakage?'): type={rF.get('type')}")
    assert rF.get('type') == 'text' and rF.get('type') != 'off_topic', f"Test F failed: {rF}"

    # TEST G: Ask "What is tile fixing?" -> EXPECTED: Construction answer.
    sG = "sess_testG_" + str(uuid.uuid4())[:8]
    rG = process_chat_message(sG, "What is tile fixing?")
    print(f"TEST G ('What is tile fixing?'): type={rG.get('type')}")
    assert rG.get('type') == 'text' and rG.get('type') != 'off_topic', f"Test G failed: {rG}"

    # TEST H: Start "I want to build a house" -> 1500 -> When asked location enter "What is Fe500?" -> EXPECTED: DO NOT save as location. Answer Fe500 & ask location again.
    sH = "sess_testH_" + str(uuid.uuid4())[:8]
    process_chat_message(sH, "I want to build a house")
    process_chat_message(sH, "1500")
    rH3 = process_chat_message(sH, "What is Fe500?")
    sessionH_obj = ChatbotSession.objects.get(session_id=sH)
    print(f"TEST H ('Question during WAITING_FOR_LOCATION'): type={rH3.get('type')}, state={sessionH_obj.state}, location={sessionH_obj.city_region}")
    assert sessionH_obj.city_region is None and sessionH_obj.state == 'WAITING_FOR_LOCATION', f"Test H state corruption failed: {sessionH_obj.city_region}"
    assert 'Fe500' in rH3.get('message', ''), f"Test H message failed: {rH3}"

    # TEST I: After completed estimate, ask "What is ceiling leakage?" -> EXPECTED: Construction answer. Previous estimate not corrupted.
    sI = "sess_testI_" + str(uuid.uuid4())[:8]
    process_chat_message(sI, "Build a House")
    process_chat_message(sI, "1500")
    process_chat_message(sI, "Tenkasi")
    process_chat_message(sI, "UltraTech")
    process_chat_message(sI, "Tata Tiscon")
    process_chat_message(sI, "8")
    process_chat_message(sI, "Select Standard")
    process_chat_message(sI, "Confirm Package")
    rI_leak = process_chat_message(sI, "What is ceiling leakage?")
    print(f"TEST I ('Question after estimate completed'): type={rI_leak.get('type')}")
    assert rI_leak.get('type') == 'text' and rI_leak.get('type') != 'off_topic', f"Test I failed: {rI_leak}"

    # TEST J: Ask "cement price" -> state WAITING_FOR_MATERIAL_LOCATION -> Enter "tenkasi" -> EXPECTED: web_research result for tenkasi. NOT off_topic!
    sJ = "sess_testJ_" + str(uuid.uuid4())[:8]
    rJ1 = process_chat_message(sJ, "cement price")
    assert rJ1.get('session_state') == 'WAITING_FOR_MATERIAL_LOCATION', f"Test J1 failed: {rJ1}"
    rJ2 = process_chat_message(sJ, "tenkasi")
    print(f"TEST J ('cement price -> tenkasi'): type={rJ2.get('type')}, state={rJ2.get('session_state')}")
    assert rJ2.get('type') == 'web_research', f"Test J2 failed: {rJ2}"

    print("\n==================================================")
    print("✅ ALL SCENARIO TESTS (A - J) PASSED PERFECTLY!")
    print("==================================================\n")

if __name__ == '__main__':
    run_tests_a_i()

