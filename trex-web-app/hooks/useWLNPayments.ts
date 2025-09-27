import { Invoice } from '@/app/invoices/page'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const useWLNPayments = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['wln-payment-tracker'],
    mutationFn: async (invoice: Invoice) => {
      if (!window.webln) {
        alert('Please install a WebLN compatible wallet')
        return
      }
      try {
        await window.webln.enable()
        const result = await window.webln.sendPayment(invoice.paymentRequest)
        console.log('Payment successful:', result)
        return {
          preImage: result.preimage,
          invoice: invoice,
          status: 'paid',
        }
      } catch (error) {
        return {
          preImage: '',
          invoice: invoice,
          status: 'failed',
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wln-payment-tracker'] })
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['wln-payment-tracker'] })
    },
  })
}

export default useWLNPayments
