import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'

// Montserrat for clean, modern UI
const montserrat = Montserrat({
    subsets: ['latin'],
    variable: '--font-montserrat',
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'Utilyze - Customer Portal',
    description: 'Pay your utility bills with crypto-backed settlements. Gas and water payments made simple.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en-AU">
            <head>
                <link
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
                    rel="stylesheet"
                />
                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                <script src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"></script>
            </head>
            <body className={`${montserrat.variable} font-sans antialiased bg-slate-50 text-slate-800`}>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    )
}

