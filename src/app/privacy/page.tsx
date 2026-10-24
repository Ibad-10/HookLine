import InfoPage from "@/components/InfoPage";

export default function Privacy() {
  return (
    <InfoPage title="Your" em="privacy">
      <p>Draft for the hackathon; not yet reviewed by a lawyer.</p>
      <h2>What we keep</h2>
      <p>Your sign-in account (through Clerk), a first name, the answers you give in lessons, and which scam types you find hard. Nothing else.</p>
      <h2>What we never keep</h2>
      <p>Card numbers, codes, passwords or bank details. During practice calls, anything that looks like them is masked on your device and the call stops.</p>
      <h2>Who sees what</h2>
      <p>Practice calls use ElevenLabs speech-to-text, which hears your voice to turn it into words. Lessons are written by AI models through Mubit, which sees masked text only. You can delete your data from Settings.</p>
    </InfoPage>
  );
}
