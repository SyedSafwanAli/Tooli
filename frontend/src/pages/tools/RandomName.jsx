import { useState, useCallback } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import ResultActions from '../../components/common/ResultActions';
import { RandomNameIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Random Name Generator creates realistic-sounding random names for use in software testing, game characters, fiction writing, or any other purpose. Choose male, female, or mixed first names and optionally include a surname.',
  howTo: [
    'Select the gender for first names: male, female, or any.',
    'Choose whether to include a surname.',
    'Set how many names to generate (1–100).',
    'Click Generate or press the button to get new names.',
  ],
  features: [
    'Male, female, or mixed first names',
    'Optional surname generation',
    'Generate 1–100 names at once',
    'Copy all names with one click',
    'Regenerate to get different names',
    '100% client-side — no data sent to server',
  ],
  faq: [
    { q: 'Are the names realistic?', a: 'Names are selected from curated lists of common English-language first names and surnames. They are realistic but random.' },
    { q: 'Can I use these names commercially?', a: 'These are fictional, randomly combined names. They are free to use for any purpose including commercial projects.' },
    { q: 'What is the maximum number of names I can generate?', a: 'Up to 100 names per generation.' },
  ],
};

const MALE_FIRST = ['James','John','Robert','Michael','William','David','Richard','Joseph','Thomas','Charles','Christopher','Daniel','Matthew','Anthony','Mark','Donald','Steven','Paul','Andrew','Joshua','Kenneth','Kevin','Brian','George','Timothy','Ronald','Edward','Jason','Jeffrey','Ryan','Jacob','Gary','Nicholas','Eric','Jonathan','Stephen','Larry','Justin','Scott','Brandon','Benjamin','Samuel','Gregory','Frank','Raymond','Patrick','Jack','Dennis','Jerry','Alexander','Tyler','Henry','Douglas','Aaron','Peter','Jose','Walter','Adam','Ethan','Harold','Zachary','Peter','Kyle','Noah','Nathan','Christian','Alan','Wayne','Roy','Louis','Dylan','Carlos','Logan','Sean','Jordan','Jesse','Bryan','Harry','Alan'];

const FEMALE_FIRST = ['Mary','Patricia','Jennifer','Linda','Barbara','Elizabeth','Susan','Jessica','Sarah','Karen','Lisa','Nancy','Betty','Margaret','Sandra','Ashley','Dorothy','Kimberly','Emily','Donna','Michelle','Carol','Amanda','Melissa','Deborah','Stephanie','Rebecca','Sharon','Laura','Cynthia','Kathleen','Amy','Angela','Shirley','Anna','Brenda','Pamela','Emma','Nicole','Helen','Samantha','Katherine','Christine','Debra','Rachel','Carolyn','Janet','Catherine','Maria','Heather','Diane','Julie','Joyce','Victoria','Kelly','Christina','Joan','Lauren','Evelyn','Olivia','Judith','Megan','Cheryl','Andrea','Hannah','Martha','Jacqueline','Frances','Gloria','Ann','Teresa','Kathryn','Sara','Janice','Julia','Marie','Madison','Grace','Judy','Alice','Beverly','Denise','Marilyn','Amber','Danielle','Brittany'];

const SURNAMES = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts','Evans','Turner','Collins','Parker','Edwards','Stewart','Flores','Morris','Nguyen','Murphy','Rivera','Cook','Rogers','Morgan','Peterson','Cooper','Reed','Bailey','Bell','Gomez','Kelly','Howard','Ward','Cox','Diaz','Richardson','Wood','Watson','Brooks','Bennett','Gray','James','Reyes','Cruz','Hughes','Price','Myers','Long','Foster','Sanders','Ross','Morales'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export default function RandomName() {
  const [gender, setGender]       = useState('any');
  const [includeLast, setLast]    = useState(true);
  const [count, setCount]         = useState(10);
  const [names, setNames]         = useState([]);

  useSEO({
    title: 'Random Name Generator',
    description: 'Generate random names for testing, games, or fiction. Male, female, or mixed. With or without surnames. Free, instant, browser-based.',
    keywords: ['random name generator', 'random names', 'fake name generator', 'random first name', 'generate names for testing'],
    jsonLd: [
      buildToolSchema({ name: 'Random Name Generator', description: 'Generate random male, female, or mixed names with optional surnames', url: '/tools/random-name' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/random-name',
  });

  const generate = useCallback(() => {
    const pool = gender === 'male' ? MALE_FIRST : gender === 'female' ? FEMALE_FIRST : [...MALE_FIRST, ...FEMALE_FIRST];
    const n = Math.max(1, Math.min(100, count));
    const result = Array.from({ length: n }, () => {
      const first = pick(pool);
      return includeLast ? `${first} ${pick(SURNAMES)}` : first;
    });
    setNames(result);
  }, [gender, includeLast, count]);

  const copyText = names.join('\n');

  return (
    <ToolLayout
      title="Random Name Generator"
      description="Generate realistic random names for testing, games, or fiction — instantly."
      icon={<RandomNameIcon className="w-6 h-6" />}
      category="Utility"
      seoContent={seoContent}
    >
      <div className="card space-y-5">
        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Gender</label>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {[['any','Any'],['male','Male'],['female','Female']].map(([v,l]) => (
                <button key={v} onClick={() => setGender(v)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${gender === v ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Include Surname</label>
            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <div onClick={() => setLast(v => !v)}
                className={`relative w-9 h-5 rounded-full transition-colors ${includeLast ? 'bg-blue-600' : 'bg-gray-200'}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${includeLast ? 'translate-x-4' : ''}`} />
              </div>
              <span className="text-sm text-gray-700">{includeLast ? 'Yes' : 'No'}</span>
            </label>
          </div>
          <div>
            <label className="label">Count</label>
            <input type="number" min="1" max="100" className="input"
              value={count} onChange={e => setCount(parseInt(e.target.value) || 10)} />
          </div>
        </div>

        <button
          onClick={generate}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
        >
          Generate Names
        </button>

        {names.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{names.length} names generated</span>
              <ResultActions copyText={copyText} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-72 overflow-y-auto">
              {names.map((name, i) => (
                <div key={i}
                  onClick={() => navigator.clipboard.writeText(name)}
                  className="px-3 py-2 bg-gray-50 hover:bg-blue-50 rounded-lg text-sm text-gray-700 cursor-pointer transition-colors truncate"
                  title="Click to copy">
                  {name}
                </div>
              ))}
            </div>
          </div>
        )}

        {names.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-2">Click Generate to create names.</p>
        )}
      </div>
    </ToolLayout>
  );
}
