'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import useWLNPayments from '@/hooks/useWLNPayments'
import { Check, Copy, Zap } from 'lucide-react'
import { useState } from 'react'

export interface Invoice {
  id: string
  paymentRequest: string
  amount: number
  description: string
  timestamp: number
  rHash: string
  status: 'pending' | 'paid' | 'failed'
}

export const invoices: Invoice[] = [
  {
    id: '1',
    paymentRequest:
      'lnbc10n1p5d05qgdp42dmkzupqwdmkzuzlxymn2wpexuenjdfcxsenqhmcd3erg6n5vgckxnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5hxz7z57kdywwkmk6d5l64zmreln2aqwy3acggjv6gwpj86x5mtqssp5hcvve4mx5uvm9cxlkhesmy2p8qw78lwpu323ssjzp3qfk6d09zps9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjqtssq7x3edjaxqkcsy0w44ss7m0nfr2e5t7erazmypvq4n26mv9rze0s50u8ee8z0r509a3eygfw5er0k5at3tf0ta3acy2x2ggvdfccqp7ufqp',
    rHash: 'b985e153d6691ceb6eda6d3faa8b63cfe6ae81c48f7084499a438323e8d4dac1',
    amount: 1,
    description: '☕️ Coffee and Pastry at Lightning Cafe',
    timestamp: Date.now(),
    status: 'paid',
  },
  {
    id: '2',
    amount: 1,
    paymentRequest:
      'lnbc20n1p5d043ddp42dmkzupqwdmkzuzlxymn2wpexu6n2vesxgmnvhmdxpexzdr5d35kynp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp539ckptg2drpmd6h4ayr32lrs00uu6femmpu6ts6hhnhkzx5n32uqsp544mdfm2s4sz9zym2yy7zad6zzna9mqhkcfca4pv4kcvd6f9tpsrq9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjq96ngujvypgu7nd8g4yhcg4akfyrgt0rt4yu5p6w7fesactp2neyk9cag0nej7acv8ldhemwsmxy6nzg4scccuqtqexzvcy4fhz96drqqtsq2p6',
    description: '🎮 Monthly Gaming Server Subscription',
    rHash: '',
    timestamp: Date.now() - 3600000,
    status: 'paid',
  },
  {
    id: '3',
    paymentRequest:
      'lnbc20n1p5d046adp42dmkzupqwdmkzuzlxymn2wpexu6nsve4xscnwhm50fuxswr5w4kh5np4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp53kdd6vkl828zdcmjs7hp9g4f5mgkq7vw6tc3hhg9fp4ta6qw657ssp597kkzgdr40gqfsepennw22nt7du82gaypenerhj4y0d2xzl3ds0q9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjq5vfcrlt09algwkx8f4mlgu07r0fslh2c5hqw3cfk3pl5tqwx2k2jd2pnnrd79sz6j86r3r5yhjurtc2fv22vst9ahjn28kusjrx584cpsy9pw7',
    rHash: '8d9add32df3a8e26e37287ae12a2a9a6d160798ed2f11bdd05486abee80ed53d',
    amount: 1,
    description: '📚 Digital Art Commission - Initial Payment',
    timestamp: Date.now() - 7200000,
    status: 'paid',
  },
  {
    id: '4',
    paymentRequest:
      'lnbc30n1p5d047fdp42dmkzupqwdmkzuzlxymn2wpexu6njdpnxsunzhesw9ehq7n2v33h2np4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5820xefg6ndycvzsr67zdu9hzaztqufh0hc5cq0w4yf77dy8rnjgqsp5a0nvw03cf34za366xam5j5qms5aujrs594dplr3dgusu23jeu94s9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjqtf4zygy8vsgjr6jfwrlzhha6nnznr5vev6mvuq9qq6avpwdqlq0zundr4qhwdkp5v8x4ftl9q7cthl3t0u6n92cp8qytpgd4x5jgsugqufs27w',
    rHash: '3a9e6ca51a9b49860a03d784de16e2e8960e26efbe29803dd5227de690e39c90',
    amount: 1,
    description: '🎵 Podcast Creator Support - March 2024',
    timestamp: Date.now() - 10800000,
    status: 'paid',
  },
  {
    id: '5',
    paymentRequest:
      'lnbc20n1p5d0kp9dp42dmkzupqwdmkzuzlxymn2wpexumrqve4x5eryhmkx3chs7tkw33nwnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5rtsmclsd9a4m3xwpxv8rfmjkgs7zkktvy4tg2tau3qqqqlft7ymssp52rn08cvnudnmlvknhvqptdek9esllenkzxn06qvd9fadm6wswuhs9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjqlrnaxs29f0kzdspqaze8fs9k0jccaehgdraap8xa5klgamxwsad5p394fpjeagce7a30dp0c8x83e3h8pqw758fe0laqs80yaz60necq2gf4ur',
    rHash: '1ae1bc7e0d2f6bb899c1330e34ee56443c2b596c2556852fbc8800007d2bf137',
    amount: 2.5,
    description: '🛠 Developer Tools Premium Access - Q2',
    timestamp: Date.now() - 14400000,
    status: 'paid',
  },
]

export default function InvoicesPage() {
  // Mock data - replace with your actual data source
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      paymentRequest:
        'lnbc10n1p5d05qgdp42dmkzupqwdmkzuzlxymn2wpexuenjdfcxsenqhmcd3erg6n5vgckxnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5hxz7z57kdywwkmk6d5l64zmreln2aqwy3acggjv6gwpj86x5mtqssp5hcvve4mx5uvm9cxlkhesmy2p8qw78lwpu323ssjzp3qfk6d09zps9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjqtssq7x3edjaxqkcsy0w44ss7m0nfr2e5t7erazmypvq4n26mv9rze0s50u8ee8z0r509a3eygfw5er0k5at3tf0ta3acy2x2ggvdfccqp7ufqp',
      rHash: 'b985e153d6691ceb6eda6d3faa8b63cfe6ae81c48f7084499a438323e8d4dac1',
      amount: 1,
      description: '☕️ Coffee and Pastry at Lightning Cafe',
      timestamp: Date.now(),
      status: 'paid',
    },
    {
      id: '2',
      amount: 1,
      paymentRequest:
        'lnbc20n1p5d043ddp42dmkzupqwdmkzuzlxymn2wpexu6n2vesxgmnvhmdxpexzdr5d35kynp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp539ckptg2drpmd6h4ayr32lrs00uu6femmpu6ts6hhnhkzx5n32uqsp544mdfm2s4sz9zym2yy7zad6zzna9mqhkcfca4pv4kcvd6f9tpsrq9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjq96ngujvypgu7nd8g4yhcg4akfyrgt0rt4yu5p6w7fesactp2neyk9cag0nej7acv8ldhemwsmxy6nzg4scccuqtqexzvcy4fhz96drqqtsq2p6',
      description: '🎮 Monthly Gaming Server Subscription',
      rHash: '',
      timestamp: Date.now() - 3600000,
      status: 'paid',
    },
    {
      id: '3',
      paymentRequest:
        'lnbc20n1p5d046adp42dmkzupqwdmkzuzlxymn2wpexu6nsve4xscnwhm50fuxswr5w4kh5np4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp53kdd6vkl828zdcmjs7hp9g4f5mgkq7vw6tc3hhg9fp4ta6qw657ssp597kkzgdr40gqfsepennw22nt7du82gaypenerhj4y0d2xzl3ds0q9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjq5vfcrlt09algwkx8f4mlgu07r0fslh2c5hqw3cfk3pl5tqwx2k2jd2pnnrd79sz6j86r3r5yhjurtc2fv22vst9ahjn28kusjrx584cpsy9pw7',
      rHash: '8d9add32df3a8e26e37287ae12a2a9a6d160798ed2f11bdd05486abee80ed53d',
      amount: 1,
      description: '📚 Digital Art Commission - Initial Payment',
      timestamp: Date.now() - 7200000,
      status: 'paid',
    },
    {
      id: '4',
      paymentRequest:
        'lnbc30n1p5d047fdp42dmkzupqwdmkzuzlxymn2wpexu6njdpnxsunzhesw9ehq7n2v33h2np4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5820xefg6ndycvzsr67zdu9hzaztqufh0hc5cq0w4yf77dy8rnjgqsp5a0nvw03cf34za366xam5j5qms5aujrs594dplr3dgusu23jeu94s9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjqtf4zygy8vsgjr6jfwrlzhha6nnznr5vev6mvuq9qq6avpwdqlq0zundr4qhwdkp5v8x4ftl9q7cthl3t0u6n92cp8qytpgd4x5jgsugqufs27w',
      rHash: '3a9e6ca51a9b49860a03d784de16e2e8960e26efbe29803dd5227de690e39c90',
      amount: 1,
      description: '🎵 Podcast Creator Support - March 2024',
      timestamp: Date.now() - 10800000,
      status: 'pending',
    },
    {
      id: '5',
      paymentRequest:
        'lnbc20n1p5d0kp9dp42dmkzupqwdmkzuzlxymn2wpexumrqve4x5eryhmkx3chs7tkw33nwnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5rtsmclsd9a4m3xwpxv8rfmjkgs7zkktvy4tg2tau3qqqqlft7ymssp52rn08cvnudnmlvknhvqptdek9esllenkzxn06qvd9fadm6wswuhs9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjqlrnaxs29f0kzdspqaze8fs9k0jccaehgdraap8xa5klgamxwsad5p394fpjeagce7a30dp0c8x83e3h8pqw758fe0laqs80yaz60necq2gf4ur',
      rHash: '1ae1bc7e0d2f6bb899c1330e34ee56443c2b596c2556852fbc8800007d2bf137',
      amount: 2.5,
      description: '🛠 Developer Tools Premium Access - Q2',
      timestamp: Date.now() - 14400000,
      status: 'paid',
    },
  ])

  const [copied, setCopied] = useState<string | null>(null)
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null)

  const handleCopy = async (paymentRequest: string, id: string) => {
    await navigator.clipboard.writeText(paymentRequest)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const { mutateAsync: payWithWebLN } = useWLNPayments()
  const handlePayWithWebLN = async (invoice: Invoice) => {
    if (!window.webln) {
      alert('Please install a WebLN compatible wallet')
      return
    }
    try {
      setPayingInvoiceId(invoice.id)
      const result = await payWithWebLN(invoice)
      console.log('Payment successful:', result)
      setInvoices(
        invoices.map((inv) =>
          inv.id === invoice.id ? { ...inv, status: 'paid' } : inv
        )
      )
    } catch (error) {
      console.error('Payment failed:', error)
      setInvoices(
        invoices.map((inv) =>
          inv.id === invoice.id ? { ...inv, status: 'failed' } : inv
        )
      )
    } finally {
      setPayingInvoiceId(null)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            <CardTitle className="text-2xl">Lightning Invoices</CardTitle>
          </div>
        </div>
        <CardDescription>
          View and manage your Lightning Network payment history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border bg-accent/50 hover:bg-accent transition-colors"
            >
              <div className="space-y-1 mb-4 sm:mb-0">
                <h3 className="font-medium text-lg flex items-center gap-2">
                  {invoice.description}
                  {invoice.status === 'paid' && (
                    <Check className="h-5 w-5 text-green-500" />
                  )}
                  {invoice.status === 'failed' && (
                    <span className="text-sm px-2 py-1 rounded-full bg-destructive/10 text-destructive">
                      Failed
                    </span>
                  )}
                  {invoice.status === 'pending' && (
                    <span className="text-sm px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500">
                      Pending
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{new Date(invoice.timestamp).toLocaleString()}</span>
                  <span className="font-mono">{invoice.amount} sats</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <code className="flex-1 font-mono text-xs bg-muted p-2 rounded text-muted-foreground truncate">
                    {invoice.paymentRequest.slice(0, 16)}+"..."
                  </code>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 shrink-0"
                    onClick={() =>
                      handleCopy(invoice.paymentRequest, invoice.id)
                    }
                  >
                    {copied === invoice.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              {invoice.status === 'pending' && (
                <Button
                  className="w-full relative z-40 cursor-pointer max-w-[220px] mt-4"
                  variant="default"
                  size="sm"
                  onClick={() => handlePayWithWebLN(invoice)}
                  disabled={payingInvoiceId === invoice.id}
                >
                  <Zap
                    className={`h-4 w-4 mr-2 ${
                      payingInvoiceId === invoice.id ? 'animate-pulse' : ''
                    }`}
                  />
                  {payingInvoiceId === invoice.id
                    ? 'Paying...'
                    : 'Pay with WebLN'}
                </Button>
              )}
            </div>
          ))}

          {invoices.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No invoices found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
