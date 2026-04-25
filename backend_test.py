#!/usr/bin/env python3
"""
GriefTech Backend Testing Suite
Tests the THREE new backend additions as specified in the review request.
"""

import requests
import json
import re
import sys
from datetime import datetime, timedelta

# Base URL from environment
BASE_URL = "https://family-guide-3.preview.emergentagent.com/api"

def test_onboard_validation():
    """Test A) Onboard validation (Aadhaar + PIN now compulsory)"""
    print("\n=== A) TESTING ONBOARD VALIDATION ===")
    
    # Test 1: POST /api/onboard with full valid body
    print("Test 1: Valid onboard with aadhaar and pincode")
    valid_payload = {
        "deceasedName": "Ramesh Kumar Sharma",
        "dateOfDeath": "2024-05-01",
        "relationship": "son",
        "claimantName": "Suresh Kumar Sharma",
        "state": "Maharashtra",
        "city": "Pune",
        "aadhaar": "123456789012",
        "pincode": "411014",
        "assets": {
            "uan": "100200300400",
            "banks": True,
            "policies": True,
            "property": False
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/onboard", json=valid_payload, timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("✅ Valid onboard successful")
            print(f"SessionId: {data.get('sessionId')}")
            profile = data.get('profile', {})
            if 'aadhaar' in profile and 'pincode' in profile:
                print(f"✅ Profile includes aadhaar: {profile['aadhaar']}")
                print(f"✅ Profile includes pincode: {profile['pincode']}")
                # Store sessionId for later tests
                global test_session_id
                test_session_id = data.get('sessionId')
            else:
                print("❌ Profile missing aadhaar or pincode fields")
        else:
            print(f"❌ Expected 200, got {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    # Test 2: Invalid aadhaar (too short)
    print("\nTest 2: Invalid aadhaar (too short)")
    invalid_aadhaar_payload = valid_payload.copy()
    invalid_aadhaar_payload["aadhaar"] = "12345"
    
    try:
        response = requests.post(f"{BASE_URL}/onboard", json=invalid_aadhaar_payload, timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 400:
            error_text = response.text
            if "Aadhaar" in error_text:
                print("✅ Correctly rejected short aadhaar with Aadhaar error")
            else:
                print(f"❌ Error message doesn't contain 'Aadhaar': {error_text}")
        else:
            print(f"❌ Expected 400, got {response.status_code}")
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    # Test 3: Invalid pincode
    print("\nTest 3: Invalid pincode (non-numeric)")
    invalid_pincode_payload = valid_payload.copy()
    invalid_pincode_payload["pincode"] = "abc"
    
    try:
        response = requests.post(f"{BASE_URL}/onboard", json=invalid_pincode_payload, timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 400:
            error_text = response.text
            if "PIN" in error_text:
                print("✅ Correctly rejected invalid pincode with PIN error")
            else:
                print(f"❌ Error message doesn't contain 'PIN': {error_text}")
        else:
            print(f"❌ Expected 400, got {response.status_code}")
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    # Test 4: Invalid pincode (too short)
    print("\nTest 4: Invalid pincode (too short)")
    invalid_pincode_payload2 = valid_payload.copy()
    invalid_pincode_payload2["pincode"] = "111"
    
    try:
        response = requests.post(f"{BASE_URL}/onboard", json=invalid_pincode_payload2, timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 400:
            error_text = response.text
            if "PIN" in error_text:
                print("✅ Correctly rejected short pincode with PIN error")
            else:
                print(f"❌ Error message doesn't contain 'PIN': {error_text}")
        else:
            print(f"❌ Expected 400, got {response.status_code}")
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    # Test 5: Aadhaar with spaces (should be stripped)
    print("\nTest 5: Aadhaar with spaces (should be stripped and persist correctly)")
    spaced_aadhaar_payload = valid_payload.copy()
    spaced_aadhaar_payload["aadhaar"] = "1234 5678 9012"
    
    try:
        response = requests.post(f"{BASE_URL}/onboard", json=spaced_aadhaar_payload, timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            profile = data.get('profile', {})
            stored_aadhaar = profile.get('aadhaar')
            if stored_aadhaar == "123456789012":
                print("✅ Aadhaar spaces stripped correctly and persisted as 123456789012")
            else:
                print(f"❌ Aadhaar not stripped correctly. Got: {stored_aadhaar}")
        else:
            print(f"❌ Expected 200, got {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    # Test 6: Missing aadhaar field
    print("\nTest 6: Missing aadhaar field")
    no_aadhaar_payload = valid_payload.copy()
    del no_aadhaar_payload["aadhaar"]
    
    try:
        response = requests.post(f"{BASE_URL}/onboard", json=no_aadhaar_payload, timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 400:
            print("✅ Correctly rejected missing aadhaar")
        else:
            print(f"❌ Expected 400, got {response.status_code}")
    except Exception as e:
        print(f"❌ Request failed: {e}")

def test_offices_api():
    """Test B) GET /api/offices"""
    print("\n=== B) TESTING OFFICES API ===")
    
    # Test 1: PIN 411014 (Pune)
    print("Test 1: /api/offices?pin=411014 (Pune)")
    try:
        response = requests.get(f"{BASE_URL}/offices?pin=411014", timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Response received")
            print(f"PIN: {data.get('pin')}")
            print(f"City: {data.get('city')}")
            print(f"State: {data.get('state')}")
            print(f"Generic: {data.get('generic')}")
            
            groups = data.get('groups', [])
            print(f"Groups count: {len(groups)}")
            
            if data.get('pin') == '411014' and data.get('city') == 'Pune' and data.get('state') == 'Maharashtra':
                print("✅ Correct PIN, city, and state")
            else:
                print("❌ Incorrect PIN, city, or state")
            
            if data.get('generic') == False:
                print("✅ Generic is false")
            else:
                print("❌ Generic should be false")
            
            if len(groups) >= 8:
                print("✅ Groups length >= 8")
                # Check mapsLink format
                maps_links_valid = True
                for group in groups:
                    for office in group.get('offices', []):
                        maps_link = office.get('mapsLink', '')
                        if not maps_link.startswith('https://www.google.com/maps/search/'):
                            maps_links_valid = False
                            print(f"❌ Invalid mapsLink: {maps_link}")
                            break
                    if not maps_links_valid:
                        break
                
                if maps_links_valid:
                    print("✅ All mapsLinks start with correct URL")
            else:
                print(f"❌ Groups length < 8: {len(groups)}")
        else:
            print(f"❌ Expected 200, got {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    # Test 2: PIN 110001 (Delhi)
    print("\nTest 2: /api/offices?pin=110001 (Delhi)")
    try:
        response = requests.get(f"{BASE_URL}/offices?pin=110001", timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if data.get('city') == 'Delhi':
                print("✅ City is Delhi")
            else:
                print(f"❌ Expected Delhi, got {data.get('city')}")
            
            groups = data.get('groups', [])
            if len(groups) >= 8:
                print("✅ Groups length >= 8")
            else:
                print(f"❌ Groups length < 8: {len(groups)}")
        else:
            print(f"❌ Expected 200, got {response.status_code}")
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    # Test 3: PIN 400001 (Mumbai)
    print("\nTest 3: /api/offices?pin=400001 (Mumbai)")
    try:
        response = requests.get(f"{BASE_URL}/offices?pin=400001", timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if data.get('city') == 'Mumbai':
                print("✅ City is Mumbai")
            else:
                print(f"❌ Expected Mumbai, got {data.get('city')}")
        else:
            print(f"❌ Expected 200, got {response.status_code}")
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    # Test 4: PIN 560001 (Bengaluru)
    print("\nTest 4: /api/offices?pin=560001 (Bengaluru)")
    try:
        response = requests.get(f"{BASE_URL}/offices?pin=560001", timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if data.get('city') == 'Bengaluru':
                print("✅ City is Bengaluru")
            else:
                print(f"❌ Expected Bengaluru, got {data.get('city')}")
        else:
            print(f"❌ Expected 200, got {response.status_code}")
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    # Test 5: PIN 999999 (Generic)
    print("\nTest 5: /api/offices?pin=999999 (Generic)")
    try:
        response = requests.get(f"{BASE_URL}/offices?pin=999999", timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if data.get('generic') == True:
                print("✅ Generic is true")
            else:
                print(f"❌ Generic should be true, got {data.get('generic')}")
            
            groups = data.get('groups', [])
            if len(groups) == 10:
                print("✅ Groups length == 10")
                
                # Check all offices have mapsLink starting with correct URL
                all_maps_valid = True
                for group in groups:
                    for office in group.get('offices', []):
                        maps_link = office.get('mapsLink', '')
                        if not maps_link.startswith('https://www.google.com/maps/search/'):
                            all_maps_valid = False
                            print(f"❌ Invalid mapsLink: {maps_link}")
                            break
                    if not all_maps_valid:
                        break
                
                if all_maps_valid:
                    print("✅ All offices have valid mapsLinks")
            else:
                print(f"❌ Groups length != 10: {len(groups)}")
        else:
            print(f"❌ Expected 200, got {response.status_code}")
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    # Test 6: No pin and no sessionId
    print("\nTest 6: /api/offices without pin or sessionId")
    try:
        response = requests.get(f"{BASE_URL}/offices", timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 400:
            print("✅ Correctly returned 400")
        else:
            print(f"❌ Expected 400, got {response.status_code}")
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    # Test 7: Invalid pin
    print("\nTest 7: /api/offices?pin=12 (invalid)")
    try:
        response = requests.get(f"{BASE_URL}/offices?pin=12", timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 400:
            print("✅ Correctly returned 400 for invalid PIN")
        else:
            print(f"❌ Expected 400, got {response.status_code}")
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    # Test 8: Using sessionId (if we have one from onboard test)
    if 'test_session_id' in globals():
        print(f"\nTest 8: /api/offices?sessionId={test_session_id}")
        try:
            response = requests.get(f"{BASE_URL}/offices?sessionId={test_session_id}", timeout=10)
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print("✅ Successfully used sessionId to get offices")
                print(f"PIN: {data.get('pin')}")
            else:
                print(f"❌ Expected 200, got {response.status_code}")
        except Exception as e:
            print(f"❌ Request failed: {e}")

def test_epfo_iepf_integrations():
    """Test C) EPFO/IEPF integrations"""
    print("\n=== C) TESTING EPFO/IEPF INTEGRATIONS ===")
    
    # Test 1: EPFO lookup with valid UAN
    print("Test 1: POST /api/epfo-lookup with valid UAN")
    try:
        response = requests.post(f"{BASE_URL}/epfo-lookup", json={"uan": "100200300400"}, timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("✅ EPFO lookup successful")
            if data.get('found') == True:
                print("✅ Found is true")
                required_fields = ['employer', 'actions']
                for field in required_fields:
                    if field in data:
                        print(f"✅ Has {field}: {data[field]}")
                    else:
                        print(f"❌ Missing {field}")
            else:
                print("❌ Found should be true")
        else:
            print(f"❌ Expected 200, got {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    # Test 2: IEPF lookup with name
    print("\nTest 2: POST /api/iepf-lookup with name")
    try:
        response = requests.post(f"{BASE_URL}/iepf-lookup", json={"name": "Ramesh Kumar"}, timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("✅ IEPF lookup successful")
            if data.get('found') == True:
                print("✅ Found is true")
                matches = data.get('matches', [])
                if len(matches) >= 1:
                    print(f"✅ Matches array has {len(matches)} items")
                else:
                    print("❌ Matches array should have >= 1 items")
                
                if data.get('source') == 'mock':
                    print("✅ Source is mock")
                else:
                    print(f"❌ Expected source 'mock', got {data.get('source')}")
            else:
                print("❌ Found should be true")
        else:
            print(f"❌ Expected 200, got {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    # Test 3: IEPF lookup without name
    print("\nTest 3: POST /api/iepf-lookup without name")
    try:
        response = requests.post(f"{BASE_URL}/iepf-lookup", json={}, timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("✅ IEPF lookup successful")
            if data.get('found') == False:
                print("✅ Found is false (as expected for empty request)")
            else:
                print("❌ Found should be false for empty request")
        else:
            print(f"❌ Expected 200, got {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Request failed: {e}")

def test_regression():
    """Test D) Quick regression tests"""
    print("\n=== D) TESTING REGRESSION ===")
    
    # Test 1: Panic endpoint
    if 'test_session_id' in globals():
        print(f"Test 1: /api/panic/{test_session_id}")
        try:
            response = requests.get(f"{BASE_URL}/panic/{test_session_id}", timeout=10)
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                actions = data.get('actions', [])
                warning = data.get('warning', '')
                
                if len(actions) == 3:
                    print("✅ Returns exactly 3 actions")
                else:
                    print(f"❌ Expected 3 actions, got {len(actions)}")
                
                if warning:
                    print("✅ Has warning string")
                else:
                    print("❌ Missing warning")
                
                # Check if actions[0].title is a real human title (not a key)
                if actions and 'title' in actions[0]:
                    title = actions[0]['title']
                    if not title.startswith('t01.title'):
                        print(f"✅ actions[0].title is human readable: {title}")
                    else:
                        print(f"❌ actions[0].title is a key, not human readable: {title}")
                else:
                    print("❌ actions[0] missing title")
            else:
                print(f"❌ Expected 200, got {response.status_code}")
        except Exception as e:
            print(f"❌ Request failed: {e}")
    
    # Test 2: Assets scan (no monetary values)
    if 'test_session_id' in globals():
        print(f"\nTest 2: /api/assets/scan/{test_session_id}")
        try:
            response = requests.get(f"{BASE_URL}/assets/scan/{test_session_id}", timeout=10)
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                response_text = json.dumps(data)
                
                # Check for absence of monetary fields
                has_rupee = '₹' in response_text
                has_amount = 'amount' in data
                has_total = 'total' in data
                
                if not has_rupee:
                    print("✅ No ₹ symbol found")
                else:
                    print("❌ Found ₹ symbol in response")
                
                if not has_amount:
                    print("✅ No 'amount' field found")
                else:
                    print("❌ Found 'amount' field in response")
                
                if not has_total:
                    print("✅ No 'total' field found")
                else:
                    print("❌ Found 'total' field in response")
                
                # Check structure
                if 'assets' in data and 'count' in data:
                    print("✅ Has correct structure (assets, count)")
                else:
                    print("❌ Missing assets or count fields")
            else:
                print(f"❌ Expected 200, got {response.status_code}")
        except Exception as e:
            print(f"❌ Request failed: {e}")
    
    # Test 3: Chat with Hindi language
    print("\nTest 3: /api/chat with language:'hi' (Devanagari response)")
    try:
        chat_payload = {
            "message": "मुझे क्या करना चाहिए?",
            "language": "hi"
        }
        response = requests.post(f"{BASE_URL}/chat", json=chat_payload, timeout=15)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            reply = data.get('reply', '')
            print(f"Reply: {reply}")
            
            # Check for Devanagari characters (Unicode range U+0900-U+097F)
            devanagari_pattern = r'[\u0900-\u097F]'
            has_devanagari = bool(re.search(devanagari_pattern, reply))
            
            if has_devanagari:
                print("✅ Response contains Devanagari characters")
            else:
                print("❌ Response does not contain Devanagari characters")
        else:
            print(f"❌ Expected 200, got {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Request failed: {e}")

def main():
    """Run all tests"""
    print("🚀 Starting GriefTech Backend Testing Suite")
    print(f"Base URL: {BASE_URL}")
    
    try:
        test_onboard_validation()
        test_offices_api()
        test_epfo_iepf_integrations()
        test_regression()
        
        print("\n🎉 All tests completed!")
        
    except KeyboardInterrupt:
        print("\n⚠️ Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()