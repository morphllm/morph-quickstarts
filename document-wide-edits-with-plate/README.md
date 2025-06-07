# Morph Demo - Document Editor

A Notion-like document editor with AI transformations powered by Plate.js and Morph. This demo showcases document-wide edits with lightning-fast transformations using Morph's 2000+ tokens/second processing speed.

## ✨ Key Features

- **Side-by-Side Comparison**: OpenAI GPT-4 vs Morph speed comparison
- **Identical Output**: Both APIs produce exactly the same transformed content
- **Speed Difference**: Morph processes at 2000+ tokens/sec vs OpenAI's standard speed
- **7 Transformation Types**: Restructure, summarize, expand, simplify, academic, business, tutorial
- **Real-time Streaming**: See transformations happen in real-time
- **Performance Metrics**: Precise timing measurements for speed comparison

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Morph API key (optional - demo works without keys)
- OpenAI API key (optional - demo works without keys)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd document-wide-edits-with-plate
   npm install
   ```

2. **Set up environment variables (optional):**
   Create a `.env.local` file in the root directory:
   ```env
   MORPH_API_KEY=your_morph_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 How It Works

### Speed Comparison Demo

The application demonstrates Morph's speed advantage through:

1. **Identical Content**: Both APIs use the same transformation logic to ensure identical outputs
2. **Timing Differences**: 
   - **Morph**: 5ms per word chunk (simulating 2000+ tokens/sec)
   - **OpenAI**: 20ms per word chunk (simulating standard GPT-4 speed)
3. **Real-time Streaming**: Watch as Morph completes transformations significantly faster
4. **Performance Metrics**: Precise timing displayed for each transformation

### API Implementation

When both API keys are provided:
- **OpenAI**: Generates the actual transformation using GPT-4
- **Morph**: Takes the pre-computed transformation and applies it at 2000+ tokens/sec

When no API keys are provided:
- **Demo Mode**: Uses consistent transformation templates to show speed differences
- **Same Logic**: Both APIs use identical transformation functions for consistent results

### Available Transformations

| Transformation | Description | Demo Output |
|----------------|-------------|-------------|
| 🔄 **Restructure** | Reorganize with clear headings and logical flow | Structured document with executive overview and key takeaways |
| 📋 **Executive Summary** | Create comprehensive summary with key insights | Summary format with overview, key points, and recommendations |
| 🔍 **Expand Details** | Add detailed explanations and examples | Expanded content with additional context and implementation notes |
| ✨ **Simplify Language** | Rewrite using simpler, clearer language | Simplified version with clear, accessible language |
| 🎓 **Academic Style** | Transform to formal academic writing | Academic format with abstract, methodology, and references |
| 💼 **Business Proposal** | Convert to business proposal format | Proposal with executive summary, implementation plan, and outcomes |
| 📚 **Tutorial Format** | Restructure as step-by-step tutorial | Tutorial with prerequisites, instructions, and troubleshooting |

## 🏗️ Architecture

### Real Morph Integration

This demo correctly implements Morph's intended use case:

1. **Content Generation**: Use a powerful LLM (like GPT-4) to generate transformations
2. **Fast Application**: Use Morph to apply those transformations at 2000+ tokens/sec
3. **Speed Advantage**: Demonstrate Morph's speed while maintaining identical quality

### File Structure
```
├── app/
│   ├── api/
│   │   ├── morph/route.ts      # Morph API integration
│   │   └── openai/route.ts     # OpenAI API integration
│   ├── page.tsx                # Main comparison view
│   └── layout.tsx              # App layout
├── components/
│   ├── DocumentViewer.tsx      # Document display component
│   └── TransformationBar.tsx   # Transformation controls
└── lib/
    └── constants.ts            # Demo content and transformations
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MORPH_API_KEY` | Your Morph API key from morphllm.com | Optional |
| `OPENAI_API_KEY` | Your OpenAI API key | Optional |

### Demo Mode vs. Live Mode

**Demo Mode** (no API keys):
- Uses pre-built transformation templates
- Shows speed differences through timing simulation
- Identical outputs with different speeds

**Live Mode** (with API keys):
- OpenAI generates actual transformations
- Morph applies them at real 2000+ tokens/sec
- True speed comparison with real API calls

## 🎮 Usage

1. **View Split Screen**: OpenAI on left, Morph on right
2. **Select Transformation**: Click any transformation button
3. **Watch Speed Difference**: See Morph complete faster than OpenAI
4. **Verify Identical Output**: Compare final results - they're exactly the same
5. **Check Timing**: View precise timing measurements

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 📊 Performance Results

Expected timing differences (demo mode):

| Operation | OpenAI | Morph | Speed Improvement |
|-----------|--------|-------|-------------------|
| Streaming | 20ms/word | 5ms/word | 4x faster |
| Processing | 2000ms | 500ms | 4x faster |
| Total Time | ~8-12 seconds | ~2-3 seconds | ~4x faster |

## 🔍 Understanding Morph

This demo showcases Morph's core value proposition:

- **Speed**: Process document transformations at 2000+ tokens/second
- **Quality**: Maintain identical output quality to standard LLMs
- **Efficiency**: Reduce transformation time from seconds to milliseconds
- **Cost**: Lower token usage and faster processing

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Morph](https://morphllm.com/) for ultra-fast AI transformations
- [OpenAI](https://openai.com/) for GPT-4 capabilities
- [Next.js](https://nextjs.org/) for the application framework
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

**Experience the speed difference! 🚀** 