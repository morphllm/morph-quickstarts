 Test your Morph API key directly with curl
curl -X POST "https://api.morphllm.com/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-VERMdxt-XK5vfx0lbQ3FEHoB27W7Rj8GaR9CRMoCRdVU4uvj" \
  -d '{
    "model": "morph-v3-fast",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": false
  }'