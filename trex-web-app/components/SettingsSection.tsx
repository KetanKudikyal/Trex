'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

export default function SettingsSection() {
  const [settings, setSettings] = useState({
    lightningAddress: '',
    citreaRpc: '',
    oracleContract: '',
  })

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement settings save logic
    console.log('Saving settings:', settings)
  }

  const handleInputChange = (field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Settings</h2>

      <Card className="bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lightning-address">Lightning Address</Label>
              <Input
                id="lightning-address"
                type="text"
                placeholder="your@lightning.address"
                value={settings.lightningAddress}
                onChange={(e) =>
                  handleInputChange('lightningAddress', e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="citrea-rpc">Citrea RPC URL</Label>
              <Input
                id="citrea-rpc"
                type="text"
                placeholder="https://citrea-rpc.example.com"
                value={settings.citreaRpc}
                onChange={(e) => handleInputChange('citreaRpc', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="oracle-contract">Oracle Contract Address</Label>
              <Input
                id="oracle-contract"
                type="text"
                placeholder="0x..."
                value={settings.oracleContract}
                onChange={(e) =>
                  handleInputChange('oracleContract', e.target.value)
                }
              />
            </div>

            <Button type="submit" className="w-full">
              Save Settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
