/**
 * AfricanEye - Core Intelligence Dashboard Controller & AI Integration Layer
 * Integrates direct support for: OpenAI, Claude, Gemini, DeepSeek, Qwen, Kimi, Mistral, OpenRouter.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. CHAT HISTORY INITIALIZATION & STATIC RESPONSES
    // ==========================================
    const staticResponses = {
        default: `I have compiled several data feeds on this query across my active continental indices. Below is an intelligence synthesis of current indicators:

        ### Geopolitical Telemetry
        Sub-national dynamics remain aligned with core baseline expectations. Regional corridors show elevated digital infrastructure deployments.

        ### Macroeconomic Indices
        Trade flows across primary development corridors (specifically East and Southern African zones) reflect stable commodity pricing and improved trade facilitation mechanisms.

        ### Security Metrics
        Maritime transit routes maintain an active security status with zero reports of hostile interference. Ground intelligence assets confirm secure logistics passages.`,

        sahel: `### Sahel Geopolitical Risk Synthesis

        **Risk Level:** ELEVATED (Monitoring Active)
        **Core Vector:** Logistics Corridor Interdiction Risks

        #### Geopolitical Dynamics
        Regional transitions have impacted security protocols across several border sectors. Sub-national telemetry shows a consolidation of transport security networks to safeguard commercial transit.

        #### Strategic Forecast
        Infrastructure corridors remain operational but require dual-redundant tracking. Trade volumes are expected to route dynamically via coastal corridors to mitigate any prolonged transit latency.`,

        congo: `### Democratic Republic of Congo Mineral Trade Outlook

        **Risk Level:** MODERATE (Tracking Mining Vectors)
        **Core Asset Class:** Critical Transition Minerals (Cobalt, Copper, Coltan)

        #### Telemetry Analysis
        A joint infrastructure expansion at the primary mineral transit rail terminals is boosting daily export output efficiency by 18%.

        #### Geopolitical Policy
        The Ministry of Mines has finalized bilateral framework standards for verified green-mineral supply certification. This regulatory refinement is projected to decrease local market pricing premiums but significantly stabilize long-term capital inflow projections.`,

        south_africa: `### South Africa Geopolitical & Investment Synthesis

        **Risk Level:** STABLE
        **Key Metrics:** GDP Projection +2.1% | JSE Index Upward Trend

        #### Market Dynamics
        The ratification of SADC trade protocols in Sandton has successfully initiated lower-tariff regimes for regional data center infrastructure imports.

        #### Energy Grid Telemetry
        Grid performance is operating at 94% optimal efficiency due to rapid private-sector solar integrations across Gauteng and Western Cape provinces. Major logistical hubs report minimal interruptions.`
    };

    // Helper to get simulated response based on user input keywords
    function getSimulatedResponse(query) {
        const lower = query.toLowerCase();
        if (lower.includes('sahel') || lower.includes('security') || lower.includes('conflict')) {
            return staticResponses.sahel;
        } else if (lower.includes('congo') || lower.includes('mineral') || lower.includes('cobalt') || lower.includes('mining')) {
            return staticResponses.congo;
        } else if (lower.includes('south africa') || lower.includes('sandton') || lower.includes('johannesburg')) {
            return staticResponses.south_africa;
        }
        return staticResponses.default;
    }

    // ==========================================
    // 2. MODULAR AI CLIENT / API KEY HANDLER
    // ==========================================
    const aiClient = {
        // Core API callers mapping standard endpoints
        async queryAI(provider, apiKey, model, userQuery, chatHistory) {
            if (!apiKey || apiKey.trim() === '') {
                throw new Error('API Key is missing. Please configure credentials.');
            }

            // Build system prompt that enforces AfricanEye persona
            const systemPrompt = `You are AfricanEye AI, an advanced, highly professional Pan-African Intelligence Platform.
            You deliver verified geopolitical analysis, verified news, economic insight, and strategic reporting from a secure African perspective.
            Always maintain a sophisticated, precise, and objective intelligence analyst tone.
            Use professional markdown formatting including clear headers, bold text, and bullet points where appropriate.`;

            const messages = [
                { role: "system", content: systemPrompt },
                ...chatHistory,
                { role: "user", content: userQuery }
            ];

            switch (provider) {
                case 'openai':
                    return this.callOpenAI(apiKey, model || 'gpt-4o-mini', messages);
                case 'claude':
                    return this.callClaude(apiKey, model || 'claude-3-5-sonnet-20241022', messages);
                case 'gemini':
                    return this.callGemini(apiKey, model || 'gemini-1.5-pro', messages);
                case 'deepseek':
                    return this.callDeepSeek(apiKey, model || 'deepseek-chat', messages);
                case 'qwen':
                    return this.callQwen(apiKey, model || 'qwen-plus', messages);
                case 'kimi':
                    return this.callKimi(apiKey, model || 'moonshot-v1-8k', messages);
                case 'mistral':
                    return this.callMistral(apiKey, model || 'mistral-large-latest', messages);
                case 'openrouter':
                    return this.callOpenRouter(apiKey, model || 'meta-llama/llama-3.1-70b-instruct:free', messages);
                default:
                    throw new Error(`Unsupported provider: ${provider}`);
            }
        },

        // 2a. OpenAI Endpoint
        async callOpenAI(apiKey, model, messages) {
            const url = 'https://api.openai.com/v1/chat/completions';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({ model, messages, temperature: 0.2 })
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error?.message || `OpenAI API returned status ${response.status}`);
            }
            const data = await response.json();
            return data.choices[0].message.content;
        },

        // 2b. Claude (Anthropic) Endpoint
        async callClaude(apiKey, model, messages) {
            // Anthropic CORS requires proxy typically, but we implement the direct API spec
            const url = 'https://api.anthropic.com/v1/messages';
            const system = messages.find(m => m.role === 'system')?.content || '';
            const filteredMessages = messages.filter(m => m.role !== 'system');

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'dangerously-allow-the-api-key-in-the-browser': 'true'
                },
                body: JSON.stringify({
                    model,
                    system,
                    messages: filteredMessages,
                    max_tokens: 2000,
                    temperature: 0.2
                })
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error?.message || `Claude API returned status ${response.status}`);
            }
            const data = await response.json();
            return data.content[0].text;
        },

        // 2c. Gemini (Google Vertex/AI Studio) Endpoint
        async callGemini(apiKey, model, messages) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            // Map messages to Gemini's content format
            const contents = messages.filter(m => m.role !== 'system').map(m => {
                return {
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: m.content }]
                };
            });

            // Inject system instruction if present
            const systemInstructionContent = messages.find(m => m.role === 'system')?.content || '';
            const payload = { contents };
            if (systemInstructionContent) {
                payload.systemInstruction = {
                    parts: [{ text: systemInstructionContent }]
                };
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error?.message || `Gemini API returned status ${response.status}`);
            }
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        },

        // 2d. DeepSeek Endpoint
        async callDeepSeek(apiKey, model, messages) {
            const url = 'https://api.deepseek.com/chat/completions';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({ model, messages, temperature: 0.2 })
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error?.message || `DeepSeek API returned status ${response.status}`);
            }
            const data = await response.json();
            return data.choices[0].message.content;
        },

        // 2e. Qwen (DashScope / Alibaba) Endpoint
        async callQwen(apiKey, model, messages) {
            const url = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({ model, messages, temperature: 0.2 })
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error?.message || `Qwen API returned status ${response.status}`);
            }
            const data = await response.json();
            return data.choices[0].message.content;
        },

        // 2f. Kimi (Moonshot AI) Endpoint
        async callKimi(apiKey, model, messages) {
            const url = 'https://api.moonshot.cn/v1/chat/completions';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({ model, messages, temperature: 0.2 })
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error?.message || `Kimi API returned status ${response.status}`);
            }
            const data = await response.json();
            return data.choices[0].message.content;
        },

        // 2g. Mistral Endpoint
        async callMistral(apiKey, model, messages) {
            const url = 'https://api.mistral.ai/v1/chat/completions';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({ model, messages, temperature: 0.2 })
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error?.message || `Mistral API returned status ${response.status}`);
            }
            const data = await response.json();
            return data.choices[0].message.content;
        },

        // 2h. OpenRouter Endpoint
        async callOpenRouter(apiKey, model, messages) {
            const url = 'https://openrouter.ai/api/v1/chat/completions';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'AfricanEye Intelligence'
                },
                body: JSON.stringify({ model, messages, temperature: 0.2 })
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error?.message || `OpenRouter API returned status ${response.status}`);
            }
            const data = await response.json();
            return data.choices[0].message.content;
        }
    };

    // ==========================================
    // 3. TAB CONTROLLER & SIDEBAR ACTIONS
    // ==========================================
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const tabContents = document.querySelectorAll('.tab-content');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const tabName = link.getAttribute('data-tab');

            // If settings tab trigger is clicked, prevent full tab navigation unless we handle it via modal
            if (tabName === 'settings') {
                e.preventDefault();
                openSettingsModal();
                return;
            }

            e.preventDefault();

            // Set active sidebar link
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Set active tab content panel
            tabContents.forEach(tab => tab.classList.remove('active'));
            const targetTab = document.getElementById(`tab-${tabName}`);
            if (targetTab) {
                targetTab.classList.add('active');
            }
        });
    });

    // ==========================================
    // 4. SETTINGS MODAL & STATE SYNCHRONIZATION
    // ==========================================
    const settingsModal = document.getElementById('dashboard-settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const settingsForm = document.getElementById('settings-form');
    const providerSelect = document.getElementById('provider-select');
    const apiKeyInput = document.getElementById('api-key-input');
    const modelInput = document.getElementById('model-input');
    const settingsTriggers = document.querySelectorAll('.settings-trigger');

    // UI elements to update based on credentials state
    const quickProviderBadge = document.getElementById('quick-provider-name');
    const headerAiStatusText = document.getElementById('header-ai-status');
    const sidebarProviderText = document.getElementById('sidebar-provider');
    const sidebarModelText = document.getElementById('sidebar-model');
    const sidebarSourcesText = document.getElementById('sidebar-sources');

    // State Variables
    let currentProvider = localStorage.getItem('ae_provider') || 'none';
    let currentApiKey = localStorage.getItem('ae_api_key') || '';
    let currentModel = localStorage.getItem('ae_model') || '';

    function openSettingsModal() {
        // Load active values into fields
        providerSelect.value = currentProvider;
        apiKeyInput.value = currentApiKey;
        modelInput.value = currentModel;

        toggleApiKeyFieldVisibility();

        settingsModal.classList.add('active');
    }

    function closeSettingsModal() {
        settingsModal.classList.remove('active');
    }

    function toggleApiKeyFieldVisibility() {
        const apiKeyGroup = document.getElementById('api-key-group');
        const modelSelectGroup = document.getElementById('model-select-group');

        if (providerSelect.value === 'none') {
            apiKeyGroup.style.display = 'none';
            modelSelectGroup.style.display = 'none';
        } else {
            apiKeyGroup.style.display = 'flex';
            modelSelectGroup.style.display = 'flex';
        }
    }

    function syncDashboardState() {
        if (currentProvider === 'none') {
            quickProviderBadge.textContent = 'None (Offline Agent)';
            headerAiStatusText.textContent = 'Online';
            sidebarProviderText.textContent = 'None';
            sidebarModelText.textContent = 'Not Connected';
            sidebarSourcesText.textContent = '0 Connected';
        } else {
            const prettyNames = {
                openai: 'OpenAI Core',
                claude: 'Anthropic Claude',
                gemini: 'Google Gemini',
                deepseek: 'DeepSeek LLM',
                qwen: 'Alibaba Qwen',
                kimi: 'Kimi Chat',
                mistral: 'Mistral Intelligence',
                openrouter: 'OpenRouter AI'
            };

            const activeName = prettyNames[currentProvider] || currentProvider.toUpperCase();
            quickProviderBadge.textContent = activeName;
            headerAiStatusText.textContent = 'Secure Mode';
            sidebarProviderText.textContent = activeName;
            sidebarModelText.textContent = currentModel || 'Default Model';
            sidebarSourcesText.textContent = '500+ Trusted';
        }
    }

    // Save configuration settings
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();

        currentProvider = providerSelect.value;
        currentApiKey = apiKeyInput.value;
        currentModel = modelInput.value;

        localStorage.setItem('ae_provider', currentProvider);
        localStorage.setItem('ae_api_key', currentApiKey);
        localStorage.setItem('ae_model', currentModel);

        syncDashboardState();
        closeSettingsModal();

        // Direct user back to Ask AfricanEye view if credential was configured
        const askSidebarBtn = document.querySelector('[data-tab="ask"]');
        if (askSidebarBtn) {
            askSidebarBtn.click();
        }

        appendSystemMessage(`Credentials updated. Node configuration successfully initialized to **${currentProvider.toUpperCase()}**.`);
    });

    providerSelect.addEventListener('change', toggleApiKeyFieldVisibility);
    settingsTriggers.forEach(btn => btn.addEventListener('click', openSettingsModal));
    closeSettingsBtn.addEventListener('click', closeSettingsModal);

    // Initial state load
    syncDashboardState();

    // ==========================================
    // 5. CHAT FUNCTIONALITY & MESSAGING INTERACTIVE STATE
    // ==========================================
    const chatInput = document.getElementById('chat-input-text');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatMessagesContainer = document.getElementById('chat-messages');

    let localChatHistory = []; // Tracks prompt message objects for context

    function appendUserMessage(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message user';
        msgDiv.innerHTML = `
            <div class="message-sender">Officer</div>
            <div class="message-bubble">${escapeHTML(text)}</div>
        `;
        chatMessagesContainer.appendChild(msgDiv);
        scrollChatToBottom();
    }

    function appendSystemMessage(text, isMarkdown = true) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message system';

        // Simple Markdown parser to translate lines and sections for simulated and real responses
        let parsedText = isMarkdown ? parseMarkdown(text) : escapeHTML(text);

        msgDiv.innerHTML = `
            <div class="message-sender"><i class="fa-solid fa-robot"></i> AfricanEye AI</div>
            <div class="message-bubble">${parsedText}</div>
        `;
        chatMessagesContainer.appendChild(msgDiv);
        scrollChatToBottom();
    }

    function appendTypingIndicator() {
        const indicatorDiv = document.createElement('div');
        indicatorDiv.className = 'chat-message system typing-indicator';
        indicatorDiv.innerHTML = `
            <div class="message-sender"><i class="fa-solid fa-robot"></i> AfricanEye AI</div>
            <div class="message-bubble">
                <div class="typing-dots">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            </div>
        `;
        chatMessagesContainer.appendChild(indicatorDiv);
        scrollChatToBottom();
        return indicatorDiv;
    }

    function scrollChatToBottom() {
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // Basic regex-based markdown parser to represent premium bullet points, headings, and bold text
    function parseMarkdown(md) {
        let html = md;
        // Escape standard tags first to prevent injection
        html = escapeHTML(html);

        // Match headers
        html = html.replace(/^\s*#### (.*$)/gim, '<h5 style="color: var(--gold-accent); margin: 10px 0 4px; font-family: var(--font-serif); font-size: 0.95rem;">$1</h5>');
        html = html.replace(/^\s*### (.*$)/gim, '<h4 style="color: var(--gold-accent); margin: 12px 0 6px; font-family: var(--font-serif);">$1</h4>');
        html = html.replace(/^\s*## (.*$)/gim, '<h3 style="color: var(--gold-accent); margin: 16px 0 8px; font-family: var(--font-serif);">$1</h3>');
        html = html.replace(/^\s*# (.*$)/gim, '<h2 style="color: var(--gold-accent); margin: 20px 0 10px; font-family: var(--font-serif);">$1</h2>');

        // Match strong/bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--white); font-weight: 600;">$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em style="color: var(--text-secondary);">$1</em>');

        // Match newlines
        html = html.replace(/\n/g, '<br>');

        return html;
    }

    // Chat execution trigger
    async function handleChatSubmission() {
        const query = chatInput.value.trim();
        if (query === '') return;

        // Clear input and collapse height
        chatInput.value = '';
        chatInput.style.height = 'auto';

        // 1. Add User message to screen
        appendUserMessage(query);

        // 2. Insert Typing Indicator
        const typingIndicator = appendTypingIndicator();

        // 3. Route Query
        try {
            let reply = '';

            if (currentProvider === 'none') {
                // Return mock intelligence report after brief simulated thinking latency
                await new Promise(resolve => setTimeout(resolve, 1500));
                reply = getSimulatedResponse(query);
            } else {
                // Call real configured AI API
                reply = await aiClient.queryAI(currentProvider, currentApiKey, currentModel, query, localChatHistory);
            }

            // Remove typing bubble and append synthesized reply
            typingIndicator.remove();
            appendSystemMessage(reply);

            // Record conversation context
            localChatHistory.push({ role: 'user', content: query });
            localChatHistory.push({ role: 'assistant', content: reply });

            // Truncate memory context if it grows too large to maintain standard tokens
            if (localChatHistory.length > 10) {
                localChatHistory.splice(0, 2);
            }

        } catch (error) {
            typingIndicator.remove();
            appendSystemMessage(`⚠️ **SYSTEM COMPILATION ERROR**

            Failed to query node *${currentProvider.toUpperCase()}*. Details below:
            *Error:* ${error.message}

            *Solution:* Please check your internet connectivity or navigate to **Credentials Manager** to re-validate secure API keys.`);
        }
    }

    // Send Button handler
    chatSendBtn.addEventListener('click', handleChatSubmission);

    // Enter Key to trigger submission, shift-enter for normal newline
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleChatSubmission();
        }
    });

    // Auto-expand textarea vertically as user types
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = (chatInput.scrollHeight) + 'px';
    });
});
