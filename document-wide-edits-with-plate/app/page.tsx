"use client"

import React, { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import SelectableText from "@/components/SelectableText"
import ReactDiffViewer from 'react-diff-viewer-continued'

const sampleDocument = `The artificial intelligence industry has experienced unprecedented growth in recent years. Companies across various sectors are implementing AI solutions to improve efficiency and reduce costs.

Machine learning algorithms have become more sophisticated, enabling better predictions and automated decision-making processes. This technological advancement has transformed how businesses operate.

However, there are concerns about the ethical implications of AI adoption. Privacy, bias, and job displacement remain significant challenges that need to be addressed as the technology continues to evolve.

The future of AI looks promising, with potential applications in healthcare, education, transportation, and many other fields. Continued research and development will likely lead to even more innovative solutions.`

interface TransformationResult {
  updatedDocument: string
  originalDocument: string
  selectedText: string
  transformedText: string
  editInstructions: string
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
      setOpenaiResult(data)
    } else {
      console.error('OpenAI failed:', openaiResponse)
    }

    // Handle Morph result
    if (morphResponse.status === 'fulfilled' && morphResponse.value.ok) {
      const data = await morphResponse.value.json()
      setMorphResult(data)
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
                      {openaiResult.updatedDocument.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="mb-3 last:mb-0">
                          {paragraph}
                        </p>
                      ))}
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
                      {morphResult.updatedDocument.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="mb-3 last:mb-0">
                          {paragraph}
                        </p>
                      ))}
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