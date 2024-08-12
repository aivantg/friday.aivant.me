import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { ChatCompletion, ChatCompletionCreateParams } from 'openai/resources';
import { z } from 'zod';

const JOURNAL_SYSTEM_PROMPT = `You are a journaling assistant. You will receive personal journal entries, and your job is to add some simple formatting, and metadata to them. You should not change the content of the journal entries at all.

The desired format for the journal entries is as follows:
# <One-sentence title summarizing the journal entry>

<Unedited content of the journal entry you recieved>.

----
**Keywords**: <Comma-separated list of keywords that stand out from the entry (names, places, ideas, etc.)>.
**Summary**: <A 1-5 sentence summary of the journal entry, maintaining specifics about what the subject of the entry is about.>.`;

const allowedMethods = ['POST'];
const journalRequestSchema = z.object({
  message: z.string(),
});
export default async (req: NextApiRequest, res: NextApiResponse<any>) => {
  if (!allowedMethods.includes(req.method!) || req.method == 'OPTIONS') {
    return res
      .status(405)
      .send({ success: false, errorMessage: 'Method not allowed.' });
  }

  console.log('Recieved journal request. Body:', req.body);

  const journalEntryRaw = journalRequestSchema.parse(req.body);

  const response = await chatCompletion(
    journalEntryRaw.message,
    'gpt-4o-mini',
    JOURNAL_SYSTEM_PROMPT,
    undefined,
    undefined,
    false
  );

  console.log('GPT Journal Response:', JSON.stringify(response, null, 2));

  const journalEntry = response.choices[0].message.content;
  if (!journalEntry) {
    res.status(500);
    res.send('No journal entry created as GPT response was empty');
  } else {
    const result = saveDayOneEntry(journalEntry);
    res.send(result);
  }
};

export type OpenAIModel = 'gpt-4o-mini';
const openai = new OpenAI();

export type ChatCompletionParams = {};

export const chatCompletion = async (
  message: string,
  model: OpenAIModel,
  systemPrompt: string,
  functions: ChatCompletionCreateParams.Function[] | undefined,
  functionToCall: string | undefined,
  shouldReturnJSON: boolean
): Promise<ChatCompletion> => {
  return await openai.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ],
    model,
    response_format: shouldReturnJSON ? { type: 'json_object' } : undefined,
    functions,
    function_call: functionToCall ? { name: functionToCall } : undefined,
  });
};

export const assistantRequestSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('journal'),
    message: z.string(),
  }),
]);

export const saveDayOneEntry = async (note: string): Promise<string> => {
  const response = await fetch(
    'https://maker.ifttt.com/trigger/friday_to_dayone/with/key/13Z80uk8mT-kN-RWMAOPl',
    {
      method: 'post',
      body: JSON.stringify({ value1: note }),
      headers: { 'Content-Type': 'application/json' },
    }
  );
  const data = await response.text();
  console.log('Saved day one entry and recieved following response');
  console.log(data);
  return data;
};
