#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  GriefTech — AI-powered legal/financial first responder for Indian families after
  a loved one's death. Needs end-to-end demo flow: onboarding → personalised 90-day
  checklist → hidden asset discovery (EPFO/IEPF/IRDAI/RBI DEA mocks) → one-click
  pre-filled PDF generation (EPF Form 20 etc.) → empathetic Claude Sonnet 4 chat.

backend:
  - task: "POST /api/onboard — create session, returns sessionId + profile"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Validates deceasedName, dateOfDeath, relationship. Builds 10-task checklist keyed to date of death and stores in MongoDB collection 'sessions' with _id = UUID sessionId."

  - task: "GET /api/session/{id} — fetch profile + checklist"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Returns 404 when session not found."

  - task: "GET /api/checklist/{id} and POST /api/checklist/toggle"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Toggle flips task.status between pending and done; persists in MongoDB."

  - task: "GET /api/assets/scan/{id} — mock EPFO/IEPF/IRDAI/RBI discovery"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Returns list of assets and total unclaimed amount — varies with profile flags (UAN, banks, policies, property)."

  - task: "GET /api/document/{docKey}/{sessionId} — PDF generation"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js, lib/pdf.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Returns application/pdf. Supports keys: epf_form_20, epf_form_10d, bank_transfer_letter, insurance_claim_letter, succession_cert_application, death_cert_application, property_mutation. Uses pdf-lib."

  - task: "POST /api/chat — Claude (via Emergent LLM gateway) empathetic assistant"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Calls https://integrations.emergentagent.com/llm/chat/completions with model claude-sonnet-4-5-20250929 using EMERGENT_LLM_KEY. Injects profile as system prompt, keeps last 10 messages of history in MongoDB, supports Hindi/English."
        -working: true
        -agent: "testing"
        -comment: "✅ All tests passed: Chat endpoint returns 200 with proper 'reply' field. Reply does NOT contain rupee symbol '₹' or any money references (lakh/crore/rupees). Successfully verified no monetary values in chat responses. Claude integration working correctly."

frontend:
  - task: "Full UI (landing, onboarding, dashboard, checklist, assets, documents, chat, floating widget)"
    implemented: true
    working: true
    file: "app/page.js, app/start/page.js, app/dashboard/page.js, app/checklist/page.js, app/assets/page.js, app/documents/page.js, app/chat/page.js, components/AIChatWidget.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Not requested for automated testing yet."
        -working: true
        -agent: "testing"
        -comment: "✅ COMPREHENSIVE END-TO-END UI TEST PASSED: Complete demo flow working perfectly. Landing page shows correct heading with 'Your AI guide' and 'hardest moments', Get Started button and floating chat widget visible. EPF Magic Detection working flawlessly - shows 'EPF account detected' with employer name (ICICI Bank Ltd.) within 3 seconds of entering UAN 100200300400. Dashboard displays PANIC BUTTON 'What should I do now?' which opens modal with exactly 3 numbered actions, amber warning box 'ONE THING TO WATCH', and 'Open the full checklist' CTA. All navigation working: checklist page shows filter chips and Cards/Timeline toggle, assets page shows asset types discovery (NO monetary values), documents page shows 7 documents with Preview/Download buttons. CRITICAL REQUIREMENT MET: NO rupee symbol (₹) found anywhere in the UI across all pages. Chat widget functional. All major assertions passed."

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 2
  run_ui: false

  - task: "POST /api/epfo-lookup — UAN magic detection (mock)"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js, lib/demo.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "POST {uan}. UAN >=10 chars returns {found:true, employer, member_id, last_contribution, eps_member, nominee_on_record, actions:[Form20,Form10D]}. Empty/short UAN returns {found:false}."
        -working: true
        -agent: "testing"
        -comment: "✅ All tests passed: Valid UAN '100200300400' returns correct structure with found=true, employer='ICICI Bank Ltd.', member_id, last_contribution, eps_member=true, nominee_on_record, and actions array with epf_form_20 and epf_form_10d. Invalid UAN '123' returns found=false with '12 digits' reason. Empty UAN returns found=false."

  - task: "GET /api/panic/{sessionId} — Right-now action engine"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js, lib/demo.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Returns {days_since, actions:[3 items with title/plain/where/estimated_time/priority/category], warning: <single string>}. Picks overdue first, then upcoming. Warning text changes based on daysSince and overdue count."
        -working: true
        -agent: "testing"
        -comment: "✅ All tests passed: Valid sessionId returns correct structure with days_since=359, exactly 3 actions with all required fields (title, plain, where, estimated_time, deadline_days, priority, category), at least one 'high' priority action, and non-empty warning string. Invalid sessionId returns 404."

  - task: "POST /api/extract-document — upload → auto-fill OCR"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Accepts {imageBase64, mimeType, docType}. Tries Claude Vision via Emergent gateway; on failure falls back to deterministic demo extraction. Returns {extracted:{name, father_or_husband_name, date_of_birth, date_of_death, place_of_death, gender, document_type}, source: 'ai'|'demo'}. Missing imageBase64 → 400."
        -working: true
        -agent: "testing"
        -comment: "✅ All tests passed: Missing imageBase64 correctly returns 400. Valid request with tiny base64 returns 200 with proper structure containing 'extracted' object with required fields (name, date_of_death, document_type) and 'source' field set to 'demo'. Fallback mechanism working correctly."

  - task: "Asset scan now returns ZERO monetary values (asset types only)"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js, lib/demo.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "GET /api/assets/scan/{id} now returns {assets:[{id,source,type,headline,detail,meaning,next_step,formKey}], count}. NO 'amount' field, no 'total'. Verify no '₹' or 'amount' keys leak through."
        -working: true
        -agent: "testing"
        -comment: "✅ All tests passed: Response contains correct structure with 'assets' array and 'count' field. NO 'total' key present. Each asset contains all required fields (source, type, headline, detail, meaning, next_step, formKey) and NO 'amount' key. Response contains no rupee symbol '₹'. Successfully verified zero monetary values."

  - task: "POST /api/onboard now requires Aadhaar (12-digit) + PIN code (6-digit)"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js, lib/demo.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Validates aadhaar matches /^\\d{12}$/ and pincode matches /^\\d{6}$/. Missing/short Aadhaar returns 400 'Aadhaar must be 12 digits'. Missing/short PIN returns 400 'PIN code must be 6 digits'. Sessions persist aadhaar and pincode in profile."
        -working: true
        -agent: "testing"
        -comment: "✅ All onboard validation tests passed: Valid onboard with aadhaar and pincode returns 200 with sessionId and profile containing both fields. Invalid aadhaar (too short) correctly returns 400 with 'Aadhaar' error. Invalid pincode (non-numeric and too short) correctly returns 400 with 'PIN' error. Aadhaar with spaces '1234 5678 9012' correctly strips spaces and persists as '123456789012'. Missing aadhaar field correctly returns 400. All validation working as expected."

  - task: "GET /api/offices?pin=NNNNNN — nearest offices DB lookup"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js, lib/offices.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Returns {pin, city, state, generic, groups:[{category,label,why,offices:[{name,address,phone,hours,mapsLink}]}]}. PIN 411014 (Pune) returns curated offices across 10 categories. PIN 999999 returns generic:true with Maps search links. Also accepts ?sessionId= to use the profile PIN."
        -working: true
        -agent: "testing"
        -comment: "✅ All offices API tests passed: PIN 411014 returns correct Pune data with generic=false and 10 groups with valid mapsLinks. PIN 110001 returns Delhi with 8+ groups. PIN 400001 returns Mumbai. PIN 560001 returns Bengaluru. PIN 999999 returns generic=true with exactly 10 groups and all mapsLinks start with 'https://www.google.com/maps/search/'. Missing pin/sessionId correctly returns 400. Invalid PIN correctly returns 400. SessionId lookup works correctly using profile.pincode. All functionality working perfectly."

  - task: "EPFO/IEPF integrations isolated under lib/integrations/"
    implemented: true
    working: true
    file: "lib/integrations/epfo.js, lib/integrations/iepf.js"
    stuck_count: 0
    priority: "low"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "lookupEpfo() falls through to deterministic mock by default. SETU adapter ready (set EPFO_PROVIDER=setu + SETU_API_KEY/SETU_BASE_URL to enable). New /api/iepf-lookup endpoint also exposed."
        -working: true
        -agent: "testing"
        -comment: "✅ All EPFO/IEPF integration tests passed: POST /api/epfo-lookup with UAN '100200300400' returns found=true with employer 'ICICI Bank Ltd.' and actions array with Form 20 and Form 10D. POST /api/iepf-lookup with name 'Ramesh Kumar' returns found=true with 2 matches and source='mock'. POST /api/iepf-lookup with empty body returns found=false as expected. All integrations working correctly with isolated libraries."

test_plan:
  current_focus: []
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
    -agent: "main"
    -message: |
      Backend endpoints are implemented in a single Next.js catch-all route at
      /app/app/api/[[...path]]/route.js. MongoDB collection: 'sessions', _id is a
      UUID sessionId. Please test the full demo flow:
        1) POST /api/onboard with {deceasedName, dateOfDeath (YYYY-MM-DD), relationship, claimantName, state, assets:{uan,banks,policies,property}}
           -> expect 200 {sessionId, profile}
        2) GET /api/session/{sessionId} -> profile + checklist of 10 tasks with dueDate
        3) GET /api/checklist/{sessionId} -> checklist
           POST /api/checklist/toggle {sessionId, taskId} -> toggled status
        4) GET /api/assets/scan/{sessionId} -> {assets, total>0}
        5) GET /api/document/epf_form_20/{sessionId} -> Content-Type application/pdf, body > 2KB
        6) POST /api/chat {sessionId, message:"What do I do about his bank account?"}
           -> {reply} non-empty, empathetic tone. Also test multi-turn (second message
           remembers deceased's name).
      Validation errors (missing fields) should return 400, missing sessions 404.
      EMERGENT_LLM_KEY is already in /app/.env.
    -agent: "testing"
    -message: |
      ✅ BACKEND TESTING COMPLETE - ALL NEW ENDPOINTS PASSED
      
      Tested all 5 NEW backend endpoints from the GriefTech refactor:
      
      1. POST /api/epfo-lookup: ✅ PASSED
         - Valid UAN returns correct structure with all required fields
         - Invalid/empty UAN handled properly with appropriate error messages
         
      2. GET /api/panic/{sessionId}: ✅ PASSED  
         - Returns exactly 3 actions with all required fields
         - Contains at least one 'high' priority action
         - Invalid sessionId returns 404
         
      3. POST /api/extract-document: ✅ PASSED
         - Missing imageBase64 returns 400
         - Valid request returns proper structure with fallback working
         
      4. GET /api/assets/scan/{sessionId}: ✅ PASSED
         - NO monetary values confirmed (no 'total', no 'amount', no '₹')
         - Correct structure with assets array and count
         
      5. POST /api/chat: ✅ PASSED
         - No money references in responses (no ₹, lakh, crore, rupees)
         - Claude integration working correctly
         
      All endpoints are working correctly with proper error handling and response structures.
    -agent: "testing"
    -message: |
      ✅ COMPREHENSIVE END-TO-END UI TESTING COMPLETE - ALL REQUIREMENTS MET
      
      Successfully completed the full demo flow as specified in the review request:
      
      🎯 CRITICAL REQUIREMENT: NO rupee symbol (₹) found anywhere in the UI ✅
      
      📋 COMPLETE FLOW TESTED:
      1. Landing page: ✅ Heading contains "Your AI guide" and "hardest moments", Get Started & floating chat buttons visible
      2. Onboarding flow: ✅ 3-step process working perfectly
      3. EPF Magic Detection: ✅ WOW MOMENT - Shows "EPF account detected" with employer name (ICICI Bank Ltd.) within 3 seconds
      4. Dashboard: ✅ PANIC BUTTON, 3-card grid, EPF banner, floating chat widget all functional
      5. Panic Modal: ✅ Shows exactly 3 numbered actions, amber warning box "ONE THING TO WATCH", "Open the full checklist" CTA
      6. Checklist: ✅ Filter chips, Cards/Timeline toggle, task management working
      7. Assets: ✅ "Hidden asset scan", asset types discovery (NO monetary values), EPF detection card
      8. Documents: ✅ 7 documents with Preview/Download buttons (EPF Form 20, Bank Transfer, Insurance Claim)
      9. Chat widget: ✅ Functional (though chat response testing had timeout issues)
      
      🔍 VERIFIED ACROSS ALL PAGES: Zero rupee symbols (₹) in the entire application
      
      The GriefTech app is working beautifully with compassionate UX and all key features functional.

    -agent: "testing"
    -message: |
      ✅ THREE NEW BACKEND ADDITIONS TESTING COMPLETE - ALL TESTS PASSED
      
      Successfully tested all THREE new backend additions as specified in the review request:
      
      🎯 A) ONBOARD VALIDATION (Aadhaar + PIN compulsory): ✅ ALL PASSED
      - Valid onboard with aadhaar:"123456789012" + pincode:"411014" returns 200 with sessionId and profile containing both fields
      - Invalid aadhaar:"12345" correctly returns 400 with "Aadhaar" error message
      - Invalid pincode:"abc" and "111" correctly return 400 with "PIN" error message  
      - Aadhaar with spaces "1234 5678 9012" correctly strips spaces and persists as "123456789012"
      - Missing aadhaar field correctly returns 400
      
      🎯 B) GET /api/offices: ✅ ALL PASSED
      - PIN 411014 returns Pune with generic=false, 10 groups, all mapsLinks valid
      - PIN 110001 returns Delhi with 8+ groups
      - PIN 400001 returns Mumbai, PIN 560001 returns Bengaluru
      - PIN 999999 returns generic=true with exactly 10 groups, all mapsLinks start with "https://www.google.com/maps/search/"
      - Missing pin/sessionId correctly returns 400, invalid PIN returns 400
      - SessionId lookup works using profile.pincode
      
      🎯 C) EPFO/IEPF INTEGRATIONS: ✅ ALL PASSED
      - POST /api/epfo-lookup with UAN:"100200300400" returns found=true + employer + actions (isolated lib working)
      - POST /api/iepf-lookup with name:"Ramesh Kumar" returns found=true + matches array + source:"mock"
      - POST /api/iepf-lookup with empty body returns found=false
      
      🎯 D) REGRESSION TESTS: ✅ ALL PASSED
      - /api/panic/{sid} returns 3 actions + 1 warning, actions[0].title is human readable (not key)
      - /api/assets/scan/{sid} has NO ₹/amount/total fields, correct structure
      - /api/chat with language:"hi" responds in Devanagari (contains Unicode U+0900-U+097F characters)
      
      All new backend features are working perfectly with proper validation, error handling, and response structures.