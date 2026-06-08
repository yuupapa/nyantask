import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-nyan-cream flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md p-6 sm:p-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">利用規約</h1>
        <p className="text-sm text-gray-500 mb-8">最終更新日: 2026年6月8日</p>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-3">
            1. サービス概要
          </h2>
          <p className="text-gray-600 leading-relaxed">
            にゃんタスク（以下「本サービス」）は、個人開発者（結パパ）が運営する無料の
            PWA（プログレッシブウェブアプリ）です。YouTubeコンサル生の皆さまが、
            タスク管理をしながら猫を育成・収集できるToDoアプリとして提供しています。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-3">
            2. 利用条件
          </h2>
          <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-1">
            <li>本サービスの利用には Google アカウントでのログインが必要です。</li>
            <li>本サービスは無料で提供されます。</li>
            <li>
              利用者は本利用規約に同意のうえ、本サービスを利用するものとします。
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-3">
            3. 禁止事項
          </h2>
          <p className="text-gray-600 leading-relaxed mb-2">
            利用者は、以下の行為を行ってはなりません。
          </p>
          <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-1">
            <li>不正アクセス、サーバーへの過度な負荷をかける行為</li>
            <li>他の利用者や第三者への迷惑行為、嫌がらせ</li>
            <li>本サービスの運営を妨害する行為</li>
            <li>法令または公序良俗に反する行為</li>
            <li>その他、運営者が不適切と判断する行為</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-3">
            4. 免責事項
          </h2>
          <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-1">
            <li>
              本サービスは現状有姿（as-is）で提供され、データの完全性・正確性・永続性を保証するものではありません。
            </li>
            <li>
              運営者は、本サービスの中断・変更・終了により利用者に生じた損害について、一切の責任を負いません。
            </li>
            <li>
              運営者は、予告なく本サービスの内容を変更、または提供を終了することがあります。
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-3">
            5. 規約の変更
          </h2>
          <p className="text-gray-600 leading-relaxed">
            運営者は、必要と判断した場合、利用者への事前通知なく本規約を変更できるものとします。
            変更後の規約は、本ページに掲載した時点で効力を生じます。
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-700 mb-3">
            6. お問い合わせ
          </h2>
          <p className="text-gray-600 leading-relaxed">
            本サービスに関するお問い合わせは、以下のメールアドレスまでご連絡ください。
          </p>
          <p className="text-gray-600 mt-2">
            メール:{" "}
            <a
              href="mailto:musubistore2021@gmail.com"
              className="text-blue-600 underline"
            >
              musubistore2021@gmail.com
            </a>
          </p>
        </section>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-block text-blue-600 underline text-sm hover:text-blue-800 transition-colors"
          >
            ログインに戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
