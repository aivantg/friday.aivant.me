import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { ChatCompletion, ChatCompletionCreateParams } from 'openai/resources';
import { z } from 'zod';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import stream from 'stream';

const JOURNAL_SYSTEM_PROMPT = `You are a journaling assistant helping someone named Aivant (pronounced "uh-vant"). You will receive personal journal entries that are transcribed from audio. Your job is to correct any obvious spelling/punctuation/grammar mistakes in the transcription, add some simple formatting, and add some metadata. You should not change the content of the journal entries at all aside from spelling and grammar corrections.

The desired format for the journal entries is as follows:
# <One-sentence title summarizing the journal entry>

<Spell-checked content of the journal entry you recieved>.

*Keywords*: <Comma-separated list of keywords that stand out from the entry (names, places, ideas, etc.)>.

*Summary*: <A 1-5 sentence summary of the journal entry, maintaining specifics about what the subject of the entry is about>.`;

const allowedMethods = ['POST'];

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req: NextApiRequest, res: NextApiResponse<any>) => {
  if (!allowedMethods.includes(req.method!) || req.method == 'OPTIONS') {
    return res
      .status(405)
      .send({ success: false, errorMessage: 'Method not allowed.' });
  }
  console.log('Recieved journal request. Body:', req.body);
  const form = new IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing the file.' });
    }
    console.log('Parsed form:', fields, files);

    // Ensure user provided correct server secret
    const secret = fields.secret ?? [''];
    if (secret[0] !== process.env.FRIDAY_SERVER_SECRET) {
      res.status(401).json({ error: 'Invalid secret provided.' });
    }

    // See if the user provided a custom system prompt
    const systemPrompt = (fields.systemPrompt ?? [JOURNAL_SYSTEM_PROMPT])[0];
    if (!files.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    const file = files.file[0];
    const filePath = file.filepath;
    res.status(200).json({
      message:
        'File uploaded successfully. Check back later for status of transcription',
    });

    // Rename file to have same extension it did in original filename
    const extension = file.originalFilename?.split('.').pop() ?? 'm4a';
    const newFilePath = filePath + '.' + extension;
    fs.renameSync(filePath, newFilePath);

    console.log(`File uploaded. Size: ${file.size} bytes`);
    console.log(`File path: ${filePath}`);
    console.log(`New file path: ${newFilePath}`);

    try {
      // Upload the file to OpenAI Whisper API for transcription
      const response = await openai.audio.transcriptions.create({
        model: 'whisper-1',
        file: fs.createReadStream(newFilePath),
      });

      console.log(
        'OpenAI Whisper Response:',
        JSON.stringify(response, null, 2)
      );

      const transcription = response.text;

      const journalResponse = await chatCompletion(
        transcription,
        'gpt-4o-mini',
        systemPrompt,
        undefined,
        undefined,
        false
      );

      console.log('GPT Journal Response:', JSON.stringify(response, null, 2));

      const journalEntry = journalResponse.choices[0].message.content;
      if (journalEntry) {
        const result = await saveDayOneEntry(journalEntry);
        console.log('Journal Entry Saved:', result);
      }
    } catch (error) {
      console.error('Error uploading to OpenAI:', error);
      // res.status(500).json({ error: 'Failed to transcribe audio.' });
    } finally {
      // Clean up: Delete the temporary file if necessary
      fs.unlinkSync(newFilePath);
    }
  });
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
