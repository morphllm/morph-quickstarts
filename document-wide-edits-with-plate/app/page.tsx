"use client"

import React, { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import SelectableText from "@/components/SelectableText"
import ReactDiffViewer from 'react-diff-viewer-continued'

const sampleDocument = `What is the history of artificial intelligence (AI)?

It may sometimes feel like AI is a recent development in technology. After all, it's only become mainstream to use in the last several years, right? In reality, the groundwork for AI began in the early 1900s. And although the biggest strides weren't made until the 1950s, it wouldn't have been possible without the work of early experts in many different fields.

Knowing the history of AI is important in understanding where AI is now and where it may go in the future. In this article, we cover all the major developments in AI, from the groundwork laid in the early 1900s, to the major strides made in recent years.

In this article, we'll cover:

What is artificial intelligence?
The history of artificial intelligence
Groundwork for AI
Birth of AI
AI Maturation
AI Boom
AI Winter
AI Agents
Artificial General Intelligence
What does the future hold

What is artificial intelligence?

Artificial intelligence is a specialty within computer science that is concerned with creating systems that can replicate human intelligence and problem-solving abilities. They do this by taking in a myriad of data, processing it, and learning from their past in order to streamline and improve in the future. A normal computer program would need human interference in order to fix bugs and improve processes.

The history of artificial intelligence:

The idea of "artificial intelligence" goes back thousands of years, to ancient philosophers considering questions of life and death. In ancient times, inventors made things called "automatons" which were mechanical and moved independently of human intervention. The word "automaton" comes from ancient Greek, and means "acting of one's own will." One of the earliest records of an automaton comes from 400 BCE and refers to a mechanical pigeon created by a friend of the philosopher Plato. Many years later, one of the most famous automatons was created by Leonardo da Vinci around the year 1495.

So while the idea of a machine being able to function on its own is ancient, for the purposes of this article, we're going to focus on the 20th century, when engineers and scientists began to make strides toward our modern-day AI.

Groundwork for AI: 1900-1950

In the early 1900s, there was a lot of media created that centered around the idea of artificial humans. So much so that scientists of all sorts started asking the question: is it possible to create an artificial brain? Some creators even made some versions of what we now call "robots" (and the word was coined in a Czech play in 1921) though most of them were relatively simple. These were steam-powered for the most part, and some could make facial expressions and even walk.

Dates of note:

1921: Czech playwright Karel Čapek released a science fiction play "Rossum's Universal Robots" which introduced the idea of "artificial people" which he named robots. This was the first known use of the word.
1929: Japanese professor Makoto Nishimura built the first Japanese robot, named Gakutensoku.
1949: Computer scientist Edmund Callis Berkley published the book "Giant Brains, or Machines that Think" which compared the newer models of computers to human brains.

Birth of AI: 1950-1956

This range of time was when the interest in AI really came to a head. Alan Turing published his work "Computer Machinery and Intelligence" which eventually became The Turing Test, which experts used to measure computer intelligence. The term "artificial intelligence" was coined and came into popular use.

Dates of note:

1950: Alan Turing published "Computer Machinery and Intelligence" which proposed a test of machine intelligence called The Imitation Game.
1952: A computer scientist named Arthur Samuel developed a program to play checkers, which is the first to ever learn the game independently.
1955: John McCarthy held a workshop at Dartmouth on "artificial intelligence" which is the first use of the word, and how it came into popular usage.

AI maturation: 1957-1979

The time between when the phrase "artificial intelligence" was created, and the 1980s was a period of both rapid growth and struggle for AI research. The late 1950s through the 1960s was a time of creation. From programming languages that are still in use to this day to books and films that explored the idea of robots, AI became a mainstream idea quickly.

The 1970s showed similar improvements, such as the first anthropomorphic robot being built in Japan, to the first example of an autonomous vehicle being built by an engineering grad student. However, it was also a time of struggle for AI research, as the U.S. government showed little interest in continuing to fund AI research.

Notable dates include:

1958: John McCarthy created LISP (acronym for List Processing), the first programming language for AI research, which is still in popular use to this day.
1959: Arthur Samuel created the term "machine learning" when doing a speech about teaching machines to play chess better than the humans who programmed them.
1961: The first industrial robot Unimate started working on an assembly line at General Motors in New Jersey, tasked with transporting die casings and welding parts on cars (which was deemed too dangerous for humans).
1965: Edward Feigenbaum and Joshua Lederberg created the first "expert system" which was a form of AI programmed to replicate the thinking and decision-making abilities of human experts.
1966: Joseph Weizenbaum created the first "chatterbot" (later shortened to chatbot), ELIZA, a mock psychotherapist, that used natural language processing (NLP) to converse with humans.
1968: Soviet mathematician Alexey Ivakhnenko published "Group Method of Data Handling" in the journal "Avtomatika," which proposed a new approach to AI that would later become what we now know as "Deep Learning."
1973: An applied mathematician named James Lighthill gave a report to the British Science Council, underlining that strides were not as impressive as those that had been promised by scientists, which led to much-reduced support and funding for AI research from the British government.
1979: James L. Adams created The Standford Cart in 1961, which became one of the first examples of an autonomous vehicle. In '79, it successfully navigated a room full of chairs without human interference.
1979: The American Association of Artificial Intelligence which is now known as the Association for the Advancement of Artificial Intelligence (AAAI) was founded.

AI boom: 1980-1987

Most of the 1980s showed a period of rapid growth and interest in AI, now labeled as the "AI boom." This came from both breakthroughs in research, and additional government funding to support the researchers. Deep Learning techniques and the use of Expert System became more popular, both of which allowed computers to learn from their mistakes and make independent decisions.

Notable dates in this time period include:

1980: First conference of the AAAI was held at Stanford.
1980: The first expert system came into the commercial market, known as XCON (expert configurer). It was designed to assist in the ordering of computer systems by automatically picking components based on the customer's needs.
1981: The Japanese government allocated $850 million (over $2 billion dollars in today's money) to the Fifth Generation Computer project. Their aim was to create computers that could translate, converse in human language, and express reasoning on a human level.
1984: The AAAI warns of an incoming "AI Winter" where funding and interest would decrease, and make research significantly more difficult.
1985: An autonomous drawing program known as AARON is demonstrated at the AAAI conference.
1986: Ernst Dickmann and his team at Bundeswehr University of Munich created and demonstrated the first driverless car (or robot car). It could drive up to 55 mph on roads that didn't have other obstacles or human drivers.
1987: Commercial launch of Alacrity by Alactrious Inc. Alacrity was the first strategy managerial advisory system, and used a complex expert system with 3,000+ rules.

AI winter: 1987-1993

As the AAAI warned, an AI Winter came. The term describes a period of low consumer, public, and private interest in AI which leads to decreased research funding, which, in turn, leads to few breakthroughs. Both private investors and the government lost interest in AI and halted their funding due to high cost versus seemingly low return. This AI Winter came about because of some setbacks in the machine market and expert systems, including the end of the Fifth Generation project, cutbacks in strategic computing initiatives, and a slowdown in the deployment of expert systems.

Notable dates include:

1987: The market for specialized LISP-based hardware collapsed due to cheaper and more accessible competitors that could run LISP software, including those offered by IBM and Apple. This caused many specialized LISP companies to fail as the technology was now easily accessible.
1988: A computer programmer named Rollo Carpenter invented the chatbot Jabberwacky, which he programmed to provide interesting and entertaining conversation to humans.

AI agents: 1993-2011

Despite the lack of funding during the AI Winter, the early 90s showed some impressive strides forward in AI research, including the introduction of the first AI system that could beat a reigning world champion chess player. This era also saw early examples of AI agents in research settings, as well as the introduction of AI into everyday life via innovations such as the first Roomba and the first commercially-available speech recognition software on Windows computers.

The surge in interest was followed by a surge in funding for research, which allowed even more progress to be made.

Notable dates include:

1997: Deep Blue (developed by IBM) beat the world chess champion, Gary Kasparov, in a highly-publicized match, becoming the first program to beat a human chess champion.
1997: Windows released a speech recognition software (developed by Dragon Systems).
2000: Professor Cynthia Breazeal developed the first robot that could simulate human emotions with its face, which included eyes, eyebrows, ears, and a mouth. It was called Kismet.
2002: The first Roomba was released.
2003: Nasa landed two rovers onto Mars (Spirit and Opportunity) and they navigated the surface of the planet without human intervention.
2006: Companies such as Twitter, Facebook, and Netflix started utilizing AI as a part of their advertising and user experience (UX) algorithms.
2010: Microsoft launched the Xbox 360 Kinect, the first gaming hardware designed to track body movement and translate it into gaming directions.
2011: An NLP computer programmed to answer questions named Watson (created by IBM) won Jeopardy against two former champions in a televised game.
2011: Apple released Siri, the first popular virtual assistant.

Artificial General Intelligence: 2012-present

That brings us to the most recent developments in AI, up to the present day. We've seen a surge in common-use AI tools, such as virtual assistants, search engines, etc. This time period also popularized Deep Learning and Big Data.

Notable dates include:

2012: Two researchers from Google (Jeff Dean and Andrew Ng) trained a neural network to recognize cats by showing it unlabeled images and no background information.
2015: Elon Musk, Stephen Hawking, and Steve Wozniak (and over 3,000 others) signed an open letter to the worlds' government systems banning the development of (and later, use of) autonomous weapons for purposes of war.
2016: Hanson Robotics created a humanoid robot named Sophia, who became known as the first "robot citizen" and was the first robot created with a realistic human appearance and the ability to see and replicate emotions, as well as to communicate.
2017: Facebook programmed two AI chatbots to converse and learn how to negotiate, but as they went back and forth they ended up forgoing English and developing their own language, completely autonomously.
2018: A Chinese tech group called Alibaba's language-processing AI beat human intellect on a Stanford reading and comprehension test.
2019: Google's AlphaStar reached Grandmaster on the video game StarCraft 2, outperforming all but .2% of human players.
2020: OpenAI started beta testing GPT-3, a model that uses Deep Learning to create code, poetry, and other such language and writing tasks. While not the first of its kind, it is the first that creates content almost indistinguishable from those created by humans.
2021: OpenAI developed DALL-E, which can process and understand images enough to produce accurate captions, moving AI one step closer to understanding the visual world.

What does the future hold?

Now that we're back to the present, there is probably a natural next question on your mind: so what comes next for AI?

Well, we can never entirely predict the future. However, many leading experts talk about the possible futures of AI, so we can make educated guesses. We can expect to see further adoption of AI by businesses of all sizes, changes in the workforce as more automation eliminates and creates jobs in equal measure, more robotics, autonomous vehicles, and so much more.

Interested in moving your business forward with the help of AI? Learn how Tableau equips customers with the best possible data using AI analytics.`

interface TransformationResult {
  updatedDocument: string
  originalDocument: string
  selectedText: string
  transformedText: string
  editInstructions: string
  highlightedDocument: string
  timing: {
    editGenerationTime: number
    applicationTime: number
    totalTime: number
  }
}

export default function Home() {
  const [openaiResult, setOpenaiResult] = useState<TransformationResult | null>(null)
  const [morphResult, setMorphResult] = useState<TransformationResult | null>(null)
  const [isLoading, setIsLoading] = useState<{ openai: boolean, morph: boolean }>({
    openai: false,
    morph: false
  })

  const handleTransformation = async (selectedText: string, transformation: string, fullDocument: string, selectionStart: number, selectionEnd: number) => {
    setIsLoading({ openai: true, morph: true })
    
    // Start timers for both routes
    const openaiStartTime = Date.now()
    const morphStartTime = Date.now()
    
    // Call both APIs simultaneously
    const requestBody = {
      selectedText,
      transformation,
      fullDocument,
      selectionStart,
      selectionEnd
    }

    const [openaiResponse, morphResponse] = await Promise.allSettled([
      fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }),
      fetch('/api/morph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
    ])

    // Handle OpenAI result
    if (openaiResponse.status === 'fulfilled' && openaiResponse.value.ok) {
      const data = await openaiResponse.value.json()
      // Update with true end-to-end time
      const openaiTotalTime = Date.now() - openaiStartTime
      data.timing.totalTime = openaiTotalTime
      setOpenaiResult(data)
      console.log(`OpenAI end-to-end time: ${openaiTotalTime}ms (API Generation: ${data.timing.editGenerationTime}ms, Apply: ${data.timing.applicationTime}ms)`)
    } else {
      console.error('OpenAI failed:', openaiResponse)
    }

    // Handle Morph result
    if (morphResponse.status === 'fulfilled' && morphResponse.value.ok) {
      const data = await morphResponse.value.json()
      // Update with true end-to-end time
      const morphTotalTime = Date.now() - morphStartTime
      data.timing.totalTime = morphTotalTime
      setMorphResult(data)
      console.log(`Morph end-to-end time: ${morphTotalTime}ms (API Generation: ${data.timing.editGenerationTime}ms, Apply: ${data.timing.applicationTime}ms)`)
    } else {
      console.error('Morph failed:', morphResponse)
    }

    setIsLoading({ openai: false, morph: false })
  }

  const resetResults = () => {
    setOpenaiResult(null)
    setMorphResult(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Morph vs OpenAI: Document Editing Speed Comparison
            </h1>
            <Button 
              onClick={resetResults}
              variant="outline"
            >
              Reset Results
            </Button>
          </div>
          <p className="text-lg text-gray-600">
            Select any text below and choose a transformation to see how fast each approach applies edits to the full document
          </p>
        </div>

        {/* Three-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Original Document */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Original Document</CardTitle>
              <p className="text-sm text-gray-500">Select text to edit</p>
            </CardHeader>
            <CardContent>
              <SelectableText 
                content={sampleDocument}
                onTransform={handleTransformation}
              />
            </CardContent>
          </Card>

          {/* OpenAI Result */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">OpenAI Result</CardTitle>
                <Badge variant="secondary">Traditional Approach</Badge>
              </div>
              {openaiResult && (
                <div className="flex gap-2 text-xs">
                  <Badge variant="outline">
                    Edit Gen: {openaiResult.timing.editGenerationTime}ms
                  </Badge>
                  <Badge variant="outline">
                    Apply: {openaiResult.timing.applicationTime}ms
                  </Badge>
                  <Badge variant="default">
                    Total: {openaiResult.timing.totalTime}ms
                  </Badge>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {isLoading.openai ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-pulse text-gray-500">Processing document edit...</div>
                </div>
              ) : openaiResult ? (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg border">
                    <div className="text-xs text-gray-600 mb-1">Edit Applied:</div>
                    <div className="text-sm text-blue-900 font-medium">
                      "{openaiResult.selectedText}" → "{openaiResult.transformedText}"
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto border rounded-lg p-3 bg-white">
                    <div className="text-xs text-gray-600 mb-2">Updated Document:</div>
                    <div className="prose prose-sm text-gray-700 leading-relaxed">
                      {/* Render the highlighted document with HTML */}
                      <div dangerouslySetInnerHTML={{ __html: openaiResult.highlightedDocument }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-400">
                  Select text to see transformation
                </div>
              )}
            </CardContent>
          </Card>

          {/* Morph Result */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Morph Result</CardTitle>
                <Badge variant="default">Morph Fast Edit</Badge>
              </div>
              {morphResult && (
                <div className="flex gap-2 text-xs">
                  <Badge variant="outline">
                    Edit Gen: {morphResult.timing.editGenerationTime}ms
                  </Badge>
                  <Badge variant="outline">
                    Apply: {morphResult.timing.applicationTime}ms
                  </Badge>
                  <Badge variant="default">
                    Total: {morphResult.timing.totalTime}ms
                  </Badge>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {isLoading.morph ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-pulse text-gray-500">Processing document edit...</div>
                </div>
              ) : morphResult ? (
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 rounded-lg border">
                    <div className="text-xs text-gray-600 mb-1">Edit Applied:</div>
                    <div className="text-sm text-green-900 font-medium">
                      "{morphResult.selectedText}" → "{morphResult.transformedText}"
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto border rounded-lg p-3 bg-white">
                    <div className="text-xs text-gray-600 mb-2">Updated Document:</div>
                    <div className="prose prose-sm text-gray-700 leading-relaxed">
                      {/* Render the highlighted document with HTML */}
                      <div dangerouslySetInnerHTML={{ __html: morphResult.highlightedDocument }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-400">
                  Select text to see transformation
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Speed Comparison Summary */}
        {openaiResult && morphResult && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Performance Comparison: Document Edit Application</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Metric</th>
                      <th className="text-center py-3 px-4 font-semibold text-blue-600">OpenAI</th>
                      <th className="text-center py-3 px-4 font-semibold text-green-600">Morph</th>
                      <th className="text-center py-3 px-4 font-semibold text-purple-600">Speed Improvement</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-4 font-medium text-gray-900">Edit Generation Time</td>
                      <td className="py-4 px-4 text-center text-lg font-bold text-blue-600">
                        {openaiResult.timing.editGenerationTime}ms
                      </td>
                      <td className="py-4 px-4 text-center text-lg font-bold text-green-600">
                        {morphResult.timing.editGenerationTime}ms
                      </td>
                      <td className="py-4 px-4 text-center text-lg font-bold text-gray-500">
                        ~Same
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-4 font-medium text-gray-900">Document Edit Application</td>
                      <td className="py-4 px-4 text-center text-lg font-bold text-blue-600">
                        {openaiResult.timing.applicationTime}ms
                      </td>
                      <td className="py-4 px-4 text-center text-lg font-bold text-green-600">
                        {morphResult.timing.applicationTime}ms
                      </td>
                      <td className="py-4 px-4 text-center text-lg font-bold text-purple-600">
                        {Math.round((openaiResult.timing.applicationTime / morphResult.timing.applicationTime) * 10) / 10}x faster
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-4 font-medium text-gray-900">Total Processing Time</td>
                      <td className="py-4 px-4 text-center text-lg font-bold text-blue-600">
                        {openaiResult.timing.totalTime}ms
                      </td>
                      <td className="py-4 px-4 text-center text-lg font-bold text-green-600">
                        {morphResult.timing.totalTime}ms
                      </td>
                      <td className="py-4 px-4 text-center text-lg font-bold text-purple-600">
                        {Math.round((openaiResult.timing.totalTime / morphResult.timing.totalTime) * 10) / 10}x faster
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Key Insight:</strong> Both approaches generate identical edit instructions (~{morphResult.timing.editGenerationTime}ms), 
                  but Morph's specialized document editing algorithms apply changes to the full document {Math.round((openaiResult.timing.applicationTime / morphResult.timing.applicationTime) * 10) / 10}x faster, 
                  resulting in {Math.round((openaiResult.timing.totalTime / morphResult.timing.totalTime) * 10) / 10}x faster overall processing.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 