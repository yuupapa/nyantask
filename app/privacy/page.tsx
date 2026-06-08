import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-nyan-cream flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md p-6 sm:p-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          プライバシーポリシー
        </h1>
        <p className="text-sm text-gray-500 mb-8">最終更新日: 2026年6月8日</p>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-3">
            1. 収集する情報
          </h2>
          <p className="text-gray-600 leading-relaxed mb-2">
            本サービスでは、以下の情報を収集・保存します。
          </p>
          <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-1">
            <li>
              <span className="font-semibold">Google アカウント情報:</span>{" "}
              メールアドレス、表示名、アバター画像
            </li>
            <li>
              <span className="font-semibold">Gemini API キー:</span>{" "}
              ユーザーが自ら設定した API キー（Supabase Vault で暗号化して保存）
            </li>
            <li>
              <span className="font-semibold">Cookie・セッション情報:</span>{" "}
              ログイン状態の維持に使用
            </li>
            <li>
              <span className="font-semibold">Web Push 通知の購読情報:</span>{" "}
              通知機能を有効にした場合のみ収集
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-3">
            2. 利用目的
          </h2>
          <p className="text-gray-600 leading-relaxed mb-2">
            収集した情報は、以下の目的で利用します。
          </p>
          <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-1">
            <li>本サービスの提供・運営</li>
            <li>ユーザー認証・ログイン状態の管理</li>
            <li>猫との会話機能（Gemini API）の提供</li>
            <li>プッシュ通知の配信</li>
            <li>サービスの改善・不具合の修正</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-3">
            3. 第三者提供
          </h2>
          <p className="text-gray-600 leading-relaxed">
            運営者は、利用者の個人情報を第三者に提供・販売することはありません。
            ただし、本サービスの運営にあたり以下のインフラサービスを利用しており、
            これらのサービスの利用規約・プライバシーポリシーに従って情報が処理されます。
          </p>
          <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-1 mt-2">
            <li>
              <span className="font-semibold">Supabase:</span>{" "}
              認証・データベース
            </li>
            <li>
              <span className="font-semibold">Google:</span> OAuth
              認証・Gemini API
            </li>
            <li>
              <span className="font-semibold">Vercel:</span>{" "}
              ホスティング・デプロイ
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-3">
            4. データの削除
          </h2>
          <p className="text-gray-600 leading-relaxed">
            アカウント削除機能は今後提供予定です。
            提供後は、アカウントを削除すると本サービスに保存されたすべてのデータ
            （タスク情報、猫の育成データ、API キー、通知設定など）が完全に削除されます。
            削除後のデータ復元はできません。
          </p>
          <p className="text-gray-600 leading-relaxed mt-2">
            アカウント削除機能の提供前にデータの削除をご希望の場合は、
            下記のお問い合わせ先までご連絡ください。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-3">
            5. ポリシーの変更
          </h2>
          <p className="text-gray-600 leading-relaxed">
            運営者は、必要に応じて本プライバシーポリシーを変更することがあります。
            変更後のポリシーは、本ページに掲載した時点で効力を生じます。
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-700 mb-3">
            6. お問い合わせ
          </h2>
          <p className="text-gray-600 leading-relaxed">
            個人情報の取り扱いに関するお問い合わせは、以下のメールアドレスまでご連絡ください。
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
