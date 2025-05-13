import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white rounded-lg shadow-sm">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Communication en temps réel avec WebSocket & WebRTC
              </h1>
              <p className="text-gray-500 md:text-xl dark:text-gray-400">
                Discutez par messages et appels vidéo grâce à une technologie moderne et performante.
                Connectez-vous instantanément avec vos contacts, où qu'ils soient dans le monde.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/chat"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-950"
                >
                  Commencer à discuter
                </Link>
              </div>
            </div>
            <div className="mx-auto w-full max-w-[500px] relative">
              <div className="bg-gray-100 p-6 rounded-lg shadow-inner">
                <div className="bg-white p-4 rounded-md shadow-md mb-4">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 mr-2"></div>
                    <span className="font-medium">Alice</span>
                  </div>
                  <p className="bg-blue-100 p-2 rounded-lg text-sm">Bonjour, comment ça va aujourd'hui?</p>
                </div>
                <div className="bg-white p-4 rounded-md shadow-md">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-green-500 mr-2"></div>
                    <span className="font-medium">Bob</span>
                  </div>
                  <p className="bg-green-100 p-2 rounded-lg text-sm">Très bien merci! Prêt pour notre appel vidéo?</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-900">
                Fonctionnalités
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Tout ce dont vous avez besoin
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Une application moderne avec des fonctionnalités avancées pour une communication fluide et sécurisée.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
            <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border bg-white p-6 shadow-sm">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-blue-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Chat en temps réel</h3>
              <p className="text-sm text-gray-500 text-center">
                Messages instantanés avec notification de réception et d'écriture.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border bg-white p-6 shadow-sm">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-blue-600"
                >
                  <path
                    strokeLinecap="round"
                    d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Appels vidéo</h3>
              <p className="text-sm text-gray-500 text-center">
                Communication vidéo HD avec un son cristallin pour des appels de qualité.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border bg-white p-6 shadow-sm">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-blue-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Salles sécurisées</h3>
              <p className="text-sm text-gray-500 text-center">
                Créez vos propres salles privées avec des identifiants uniques pour plus de sécurité.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-blue-600 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Prêt à commencer?
              </h2>
              <p className="mx-auto max-w-[700px] text-white md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Rejoignez notre plateforme de communication et connectez-vous avec vos proches.
              </p>
            </div>
            <div className="space-x-4">
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md bg-white text-blue-600 px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950"
                href="/chat"
              >
                Accéder au chat
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
