import { Inter } from 'next/font/google';
import './globals.css';
var inter = Inter({ subsets: ['latin'] });
export var metadata = {
    title: 'Roster Copilot',
    description: 'AI-driven companion for fantasy football players',
};
export default function RootLayout(_a) {
    var children = _a.children;
    return (<html lang="en" data-theme="light">
      <body className={inter.className}>{children}</body>
    </html>);
}
