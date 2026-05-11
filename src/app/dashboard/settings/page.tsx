import { getProfile, getAiConfig, getSmtpConfig, getReferenceCv } from '@/actions/settings';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const [profile, aiConfig, smtpConfig, referenceCv] = await Promise.all([
    getProfile(),
    getAiConfig(),
    getSmtpConfig(),
    getReferenceCv(),
  ]);

  return (
    <SettingsClient
      initialProfile={{ name: profile.name ?? '', email: profile.email ?? '', phone: profile.phone ?? '', location: profile.location ?? '', summary: profile.summary ?? '', photoUrl: profile.photoUrl ?? '', portfolioUrl: profile.portfolioUrl ?? '', locale: profile.locale ?? 'fr-FR', targetRoles: profile.targetRoles ?? '', targetSalary: profile.targetSalary ?? '', dealBreakers: profile.dealBreakers ?? '', narrative: profile.narrative ?? '' }}
      initialAiConfig={{ provider: aiConfig.provider ?? 'openrouter', apiKey: aiConfig.apiKey ?? '', baseUrl: aiConfig.baseUrl ?? '', model: aiConfig.model ?? '' }}
      initialSmtpConfig={{ host: smtpConfig.host ?? '', port: smtpConfig.port ?? 587, secure: smtpConfig.secure ?? false, user: smtpConfig.user ?? '', pass: smtpConfig.pass ?? '', fromName: smtpConfig.fromName ?? '', fromEmail: smtpConfig.fromEmail ?? '' }}
      referenceCvId={referenceCv?.id ?? null}
    />
  );
}
