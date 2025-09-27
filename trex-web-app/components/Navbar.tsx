import { Button } from '@/components/ui/button'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Navbar = () => {
  const pathname = usePathname()
  return (
    <div className="flex items-center space-x-4">
      <nav className="hidden md:flex space-x-6">
        <Link href="/citrea-lightning-hub">
          <Button
            variant="ghost"
            className={`hover:bg-transparent ${
              pathname === '/citrea-lightning-hub'
                ? 'text-yellow-400'
                : 'text-white hover:text-gray-300'
            }`}
          >
            Citrea lightning Hub
          </Button>
        </Link>
        <Link href="/invoices">
          <Button
            variant="ghost"
            className={`hover:bg-transparent ${
              pathname === '/invoices'
                ? 'text-yellow-400'
                : 'text-white hover:text-gray-300'
            }`}
          >
            Invoices
          </Button>
        </Link>
        <Link href="/oracle">
          <Button
            variant="ghost"
            className={`hover:bg-transparent ${
              pathname === '/oracle'
                ? 'text-yellow-400'
                : 'text-white hover:text-gray-300'
            }`}
          >
            Oracle
          </Button>
        </Link>
        <Link href="/settings">
          <Button
            variant="ghost"
            className={`hover:bg-transparent ${
              pathname === '/settings'
                ? 'text-yellow-400'
                : 'text-white hover:text-gray-300'
            }`}
          >
            Settings
          </Button>
        </Link>
      </nav>
      <ConnectButton />
    </div>
  )
}

export default Navbar
