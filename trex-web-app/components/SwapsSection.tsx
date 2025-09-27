'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw } from 'lucide-react'
import { useState } from 'react'

interface Swap {
  id: string
  amount: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
  description?: string
}

export default function SwapsSection() {
  const [swaps, _setSwaps] = useState<Swap[]>([])

  const handleRefresh = () => {
    // TODO: Implement refresh logic
    console.log('Refreshing swaps...')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Atomic Swaps</h2>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {swaps.length === 0 ? (
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">No swaps found</p>
              <p className="text-sm text-gray-500 mt-2">
                Create your first atomic swap to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          swaps.map((swap) => (
            <Card key={swap.id} className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{swap.amount} sats</CardTitle>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      swap.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : swap.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {swap.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {swap.description && (
                  <p className="text-gray-600 mb-2">{swap.description}</p>
                )}
                <p className="text-sm text-gray-500">
                  Created: {new Date(swap.createdAt).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
