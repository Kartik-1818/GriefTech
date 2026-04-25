#!/usr/bin/env python3
"""
GriefTech Backend API Testing
Tests the NEW backend endpoints added in the GriefTech refactor.
"""

import requests
import json
import base64
import sys
from datetime import datetime

# Base URL from environment
BASE_URL = "https://family-guide-3.preview.emergentagent.com/api"

def test_onboard_setup():
    """Setup: POST /api/onboard to get sessionId for other tests"""
    print("=== SETUP: POST /api/onboard ===")
    
    payload = {
        "deceasedName": "Ramesh Kumar",
        "dateOfDeath": "2025-05-01",
        "relationship": "Son",
        "claimantName": "Arjun Kumar",
        "state": "Maharashtra",
        "city": "Pune",
        "assets": {
            "uan": "100200300400",
            "banks": True,
            "policies": True,
            "property": True
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/onboard", json=payload, timeout=30)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            session_id = data.get('sessionId')
            print(f"✅ Onboard successful, sessionId: {session_id}")
            return session_id
        else:
            print(f"❌ Onboard failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Onboard error: {str(e)}")
        return None

def test_epfo_lookup():
    """Test A: POST /api/epfo-lookup"""
    print("\n=== TEST A: POST /api/epfo-lookup ===")
    
    # Test 1: Valid UAN
    print("A1. Testing valid UAN '100200300400'")
    try:
        response = requests.post(f"{BASE_URL}/epfo-lookup", json={"uan": "100200300400"}, timeout=30)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Validate response structure
            required_fields = ['found', 'uan', 'employer', 'member_id', 'last_contribution', 'eps_member', 'nominee_on_record', 'actions']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"❌ Missing fields: {missing_fields}")
                return False
                
            if not data.get('found'):
                print("❌ Expected found=true for valid UAN")
                return False
                
            if not isinstance(data.get('employer'), str) or len(data.get('employer', '')) == 0:
                print("❌ Employer should be non-empty string")
                return False
                
            if not isinstance(data.get('member_id'), str):
                print("❌ member_id should be string")
                return False
                
            if not isinstance(data.get('eps_member'), bool):
                print("❌ eps_member should be boolean")
                return False
                
            actions = data.get('actions', [])
            if not isinstance(actions, list) or len(actions) != 2:
                print(f"❌ Expected actions array of length 2, got {len(actions)}")
                return False
                
            # Check for required form keys
            form_keys = [action.get('formKey') for action in actions]
            if 'epf_form_20' not in form_keys or 'epf_form_10d' not in form_keys:
                print(f"❌ Expected formKeys 'epf_form_20' and 'epf_form_10d', got {form_keys}")
                return False
                
            print("✅ A1 passed - valid UAN response structure correct")
        else:
            print(f"❌ A1 failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ A1 error: {str(e)}")
        return False
    
    # Test 2: Invalid UAN (too short)
    print("\nA2. Testing invalid UAN '123'")
    try:
        response = requests.post(f"{BASE_URL}/epfo-lookup", json={"uan": "123"}, timeout=30)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            if data.get('found') != False:
                print("❌ Expected found=false for invalid UAN")
                return False
                
            reason = data.get('reason', '')
            if '12 digits' not in reason:
                print(f"❌ Expected reason to contain '12 digits', got: {reason}")
                return False
                
            print("✅ A2 passed - invalid UAN handled correctly")
        else:
            print(f"❌ A2 failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ A2 error: {str(e)}")
        return False
    
    # Test 3: Empty UAN
    print("\nA3. Testing empty UAN")
    try:
        response = requests.post(f"{BASE_URL}/epfo-lookup", json={}, timeout=30)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            if data.get('found') != False:
                print("❌ Expected found=false for empty UAN")
                return False
                
            print("✅ A3 passed - empty UAN handled correctly")
        else:
            print(f"❌ A3 failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ A3 error: {str(e)}")
        return False
    
    return True

def test_panic_endpoint(session_id):
    """Test B: GET /api/panic/{sessionId}"""
    print(f"\n=== TEST B: GET /api/panic/{session_id} ===")
    
    if not session_id:
        print("❌ No sessionId available for panic test")
        return False
    
    # Test 1: Valid sessionId
    print("B1. Testing valid sessionId")
    try:
        response = requests.get(f"{BASE_URL}/panic/{session_id}", timeout=30)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Validate response structure
            required_fields = ['days_since', 'actions', 'warning']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"❌ Missing fields: {missing_fields}")
                return False
                
            if not isinstance(data.get('days_since'), int):
                print("❌ days_since should be number")
                return False
                
            actions = data.get('actions', [])
            if not isinstance(actions, list) or len(actions) != 3:
                print(f"❌ Expected exactly 3 actions, got {len(actions)}")
                return False
                
            # Check each action has required fields
            action_fields = ['title', 'plain', 'where', 'estimated_time', 'deadline_days', 'priority', 'category']
            for i, action in enumerate(actions):
                missing_action_fields = [field for field in action_fields if field not in action]
                if missing_action_fields:
                    print(f"❌ Action {i} missing fields: {missing_action_fields}")
                    return False
                    
            # Check for at least one high priority
            priorities = [action.get('priority') for action in actions]
            if 'high' not in priorities:
                print(f"❌ Expected at least one 'high' priority action, got priorities: {priorities}")
                return False
                
            warning = data.get('warning', '')
            if not isinstance(warning, str) or len(warning) == 0:
                print("❌ Warning should be non-empty string")
                return False
                
            print("✅ B1 passed - valid sessionId response structure correct")
        else:
            print(f"❌ B1 failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ B1 error: {str(e)}")
        return False
    
    # Test 2: Invalid sessionId
    print("\nB2. Testing invalid sessionId")
    try:
        response = requests.get(f"{BASE_URL}/panic/not-real-id", timeout=30)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 404:
            print("✅ B2 passed - invalid sessionId returns 404")
        else:
            print(f"❌ B2 failed - expected 404, got {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ B2 error: {str(e)}")
        return False
    
    return True

def test_extract_document():
    """Test C: POST /api/extract-document"""
    print("\n=== TEST C: POST /api/extract-document ===")
    
    # Test 1: Missing imageBase64
    print("C1. Testing missing imageBase64")
    try:
        response = requests.post(f"{BASE_URL}/extract-document", json={}, timeout=30)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 400:
            print("✅ C1 passed - missing imageBase64 returns 400")
        else:
            print(f"❌ C1 failed - expected 400, got {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ C1 error: {str(e)}")
        return False
    
    # Test 2: Valid request with tiny base64
    print("\nC2. Testing valid request with tiny base64")
    try:
        payload = {
            "imageBase64": "iVBORw0KGgo=",
            "mimeType": "image/png",
            "docType": "death_certificate"
        }
        
        response = requests.post(f"{BASE_URL}/extract-document", json=payload, timeout=30)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Validate response structure
            if 'extracted' not in data:
                print("❌ Missing 'extracted' object")
                return False
                
            if 'source' not in data:
                print("❌ Missing 'source' field")
                return False
                
            source = data.get('source')
            if source not in ['ai', 'demo']:
                print(f"❌ Source should be 'ai' or 'demo', got: {source}")
                return False
                
            extracted = data.get('extracted', {})
            required_extracted_fields = ['name', 'date_of_death', 'document_type']
            missing_extracted_fields = [field for field in required_extracted_fields if field not in extracted]
            
            if missing_extracted_fields:
                print(f"❌ Extracted object missing fields: {missing_extracted_fields}")
                return False
                
            print("✅ C2 passed - valid request returns proper structure")
        else:
            print(f"❌ C2 failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ C2 error: {str(e)}")
        return False
    
    return True

def test_assets_scan_no_money(session_id):
    """Test D: GET /api/assets/scan/{sessionId} - VERIFY NO MONEY"""
    print(f"\n=== TEST D: GET /api/assets/scan/{session_id} - NO MONEY VERIFICATION ===")
    
    if not session_id:
        print("❌ No sessionId available for assets scan test")
        return False
    
    try:
        response = requests.get(f"{BASE_URL}/assets/scan/{session_id}", timeout=30)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # D1: Response shape MUST be { assets:[...], count: number }
            if 'assets' not in data or 'count' not in data:
                print("❌ D1 failed - response must contain 'assets' and 'count'")
                return False
                
            # D2: Response MUST NOT contain key "total" anywhere
            if 'total' in data:
                print("❌ D2 failed - response must NOT contain 'total' key")
                return False
                
            assets = data.get('assets', [])
            if not isinstance(assets, list):
                print("❌ Assets should be a list")
                return False
                
            if not isinstance(data.get('count'), int):
                print("❌ Count should be a number")
                return False
                
            # D3: Each asset MUST NOT contain key "amount"
            for i, asset in enumerate(assets):
                if 'amount' in asset:
                    print(f"❌ D3 failed - asset {i} contains 'amount' key")
                    return False
                    
            # D4: Each asset MUST contain required keys
            required_asset_fields = ['source', 'type', 'headline', 'detail', 'meaning', 'next_step', 'formKey']
            for i, asset in enumerate(assets):
                missing_fields = [field for field in required_asset_fields if field not in asset]
                if missing_fields:
                    print(f"❌ D4 failed - asset {i} missing fields: {missing_fields}")
                    return False
                    
            # D5: Stringify the body and assert it does NOT contain the rupee symbol "₹"
            response_text = json.dumps(data)
            if '₹' in response_text:
                print("❌ D5 failed - response contains rupee symbol '₹'")
                return False
                
            print("✅ D1-D5 passed - assets scan contains no monetary values")
            return True
        else:
            print(f"❌ Assets scan failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Assets scan error: {str(e)}")
        return False

def test_chat_no_money(session_id):
    """Test E: Quick regression on /api/chat - NO MONEY"""
    print(f"\n=== TEST E: POST /api/chat - NO MONEY REGRESSION ===")
    
    if not session_id:
        print("❌ No sessionId available for chat test")
        return False
    
    try:
        payload = {
            "sessionId": session_id,
            "message": "What is in his EPF?"
        }
        
        response = requests.post(f"{BASE_URL}/chat", json=payload, timeout=30)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            reply = data.get('reply', '')
            if not reply:
                print("❌ Chat response should contain 'reply'")
                return False
                
            # Check that reply does NOT contain ₹ or any number followed by 'lakh'/'crore'/'rupees'
            if '₹' in reply:
                print(f"❌ Chat reply contains rupee symbol '₹': {reply}")
                return False
                
            import re
            money_pattern = r'\d+\s*(lakh|crore|rupees)'
            if re.search(money_pattern, reply, re.IGNORECASE):
                print(f"❌ Chat reply contains money references: {reply}")
                return False
                
            print("✅ E passed - chat reply contains no money references")
            return True
        else:
            print(f"❌ Chat failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Chat error: {str(e)}")
        return False

def main():
    """Run all backend tests"""
    print("🚀 Starting GriefTech Backend API Tests")
    print(f"Base URL: {BASE_URL}")
    print("=" * 60)
    
    # Setup: Get sessionId
    session_id = test_onboard_setup()
    
    # Run all tests
    test_results = {
        "epfo_lookup": test_epfo_lookup(),
        "panic": test_panic_endpoint(session_id),
        "extract_document": test_extract_document(),
        "assets_scan_no_money": test_assets_scan_no_money(session_id),
        "chat_no_money": test_chat_no_money(session_id)
    }
    
    # Summary
    print("\n" + "=" * 60)
    print("🏁 TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed!")
        return 0
    else:
        print("💥 Some tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())