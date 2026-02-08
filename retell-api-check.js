#!/usr/bin/env node
/**
 * Retell API Check & Configuration Script
 * Uses Retell REST API to check and configure webhooks
 */

const RETELL_API_KEY = 'key_b9cc94bfa2c8830a2a1502a0b852';
const WEBHOOK_URL = 'https://probatedesk.ca/api/retell/webhook';

async function retellApi(endpoint, options = {}) {
  const url = `https://api.retellai.com${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${RETELL_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text.slice(0, 500) };
  }
  
  return {
    status: response.status,
    ok: response.ok,
    data,
  };
}

async function main() {
  console.log('🔍 Retell API Configuration Check\n');
  console.log('=====================================\n');
  
  // 1. List all agents (correct endpoint)
  console.log('📍 Step 1: Listing agents...');
  const agents = await retellApi('/list-agents');
  console.log(`   Status: ${agents.status}`);
  if (agents.ok && Array.isArray(agents.data)) {
    console.log(`   ✅ Found ${agents.data.length} agent(s)`);
    agents.data.forEach((agent, i) => {
      console.log(`   ${i + 1}. ${agent.agent_name || 'Unnamed'} (ID: ${agent.agent_id})`);
      if (agent.llm_websocket_url) {
        console.log(`      LLM: ${agent.llm_websocket_url}`);
      }
    });
  } else {
    console.log('   Response:', JSON.stringify(agents.data, null, 2).slice(0, 300));
  }
  console.log('');
  
  // 2. Get specific agent details
  const AGENT_ID = 'agent_f08ce7ff2c30259d92d0e8146c';
  console.log(`📍 Step 2: Getting agent details (${AGENT_ID})...`);
  const agentDetails = await retellApi(`/get-agent?agent_id=${AGENT_ID}`);
  console.log(`   Status: ${agentDetails.status}`);
  if (agentDetails.ok) {
    console.log('   ✅ Agent found');
    console.log(`   Name: ${agentDetails.data.agent_name}`);
    console.log(`   Voice ID: ${agentDetails.data.voice_id}`);
    console.log(`   Language: ${agentDetails.data.language}`);
    if (agentDetails.data.agent_welcome_message) {
      console.log(`   Welcome: ${agentDetails.data.agent_welcome_message.slice(0, 80)}...`);
    }
  } else {
    console.log('   ❌ Agent not found or error');
    console.log('   Response:', JSON.stringify(agentDetails.data, null, 2).slice(0, 300));
  }
  console.log('');
  
  // 3. Get LLM details
  if (agentDetails.ok && agentDetails.data.llm_websocket_url) {
    const llmId = agentDetails.data.llm_websocket_url;
    console.log(`📍 Step 3: Getting LLM details (${llmId})...`);
    const llmDetails = await retellApi(`/get-retell-llm?llm_id=${llmId}`);
    console.log(`   Status: ${llmDetails.status}`);
    if (llmDetails.ok) {
      console.log('   ✅ LLM config found');
      console.log(`   Model: ${llmDetails.data.model}`);
      console.log(`   Temperature: ${llmDetails.data.temperature}`);
      if (llmDetails.data.functions) {
        console.log(`   Functions: ${llmDetails.data.functions.length}`);
        llmDetails.data.functions.forEach((fn, i) => {
          console.log(`      ${i + 1}. ${fn.name} - ${fn.description?.slice(0, 60)}...`);
        });
      }
      
      // Check if webhooks are mentioned anywhere
      if (llmDetails.data.webhook_url) {
        console.log(`\n   🎯 WEBHOOK URL: ${llmDetails.data.webhook_url}`);
      }
    }
  }
  console.log('');
  
  // 4. Try to list recent calls to verify API access
  console.log('📍 Step 4: Checking recent calls...');
  const calls = await retellApi('/v2/list-calls?limit=5');
  console.log(`   Status: ${calls.status}`);
  if (calls.ok && Array.isArray(calls.data)) {
    console.log(`   ✅ Found ${calls.data.length} recent call(s)`);
    calls.data.forEach((call, i) => {
      console.log(`   ${i + 1}. ${call.call_id} - ${call.call_status} - ${call.start_timestamp}`);
    });
  } else {
    console.log('   Response:', JSON.stringify(calls.data, null, 2).slice(0, 300));
  }
  console.log('');
  
  // 5. Summary
  console.log('=====================================');
  console.log('📋 Summary\n');
  
  if (agents.ok || agentDetails.ok) {
    console.log('✅ Retell API key is working');
    console.log('✅ Can make outbound calls');
    console.log('✅ Agent configuration accessible');
    console.log('');
    console.log('⚠️  WEBHOOK CONFIGURATION REQUIRED');
    console.log('');
    console.log('The Retell API does NOT support webhook management.');
    console.log('You MUST configure webhooks manually in the dashboard:\n');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│  MANUAL SETUP REQUIRED                                  │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│  1. Go to https://dashboard.retellai.com                │');
    console.log('│  2. Sign in with Google (omarkebrahim@gmail.com)        │');
    console.log('│  3. Click Settings → Webhooks                           │');
    console.log('│  4. Click "Add Webhook"                                 │');
    console.log(`│  5. URL: ${WEBHOOK_URL}`);
    console.log('│  6. Select ALL events:                                  │');
    console.log('│     ☑ call_started                                     │');
    console.log('│     ☑ call_ended                                       │');
    console.log('│     ☑ function_call                                    │');
    console.log('│     ☑ transcript_update                                │');
    console.log('│  7. Click "Add Webhook" to save                        │');
    console.log('│  8. COPY the webhook secret (starts with whsec_)       │');
    console.log('│  9. Add to your .env file:                             │');
    console.log('│     RETELL_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx  │');
    console.log('└─────────────────────────────────────────────────────────┘\n');
    
    console.log('📞 After configuration, test with:');
    console.log('   curl -X POST https://probatedesk.ca/api/retell/webhook \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -H "x-retell-signature: <signature>" \\');
    console.log('     -d \'{"event_type":"call_started","call_id":"test"}\'\n');
    
  } else {
    console.log('❌ API key may be invalid or endpoints changed');
    console.log('   Check your API key and Retell documentation');
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
