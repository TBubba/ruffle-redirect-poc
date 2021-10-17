window.addEventListener('load', () => init());

function init() {
  // Parse search paramters
  // @IDEA Store the "fake" and "real" roots in pairs so that each "fake" root can point to a different "real" root
  const search_params = new URLSearchParams(window.location.search);
  const fake_root = tryNewUrl(search_params.get('fake_root'));
  const real_root = tryNewUrl(search_params.get('real_root'));
  const entry     = tryNewUrl(search_params.get('entry'));

  // Display errors
  if (!(fake_root instanceof URL) || !(real_root instanceof URL) || !(entry instanceof URL)) {
    const lines: string[] = [];
    if (!(fake_root instanceof URL)) { lines.push(`* Search parameter "fake_root" must be a full URL. ${fake_root}`); }
    if (!(real_root instanceof URL)) { lines.push(`* Search parameter "real_root" must be a full URL. ${real_root}`); }
    if (!(entry     instanceof URL)) { lines.push(`* Search parameter "entry" must be a full URL. ${entry}`); }

    const header = document.createElement('h1');
    header.innerText = 'Failed to Ruffle Redirect.';
    document.body.appendChild(header);

    const errors = document.createElement('p');
    errors.innerText = lines.join('\n');
    document.body.appendChild(errors);

    return;
  }

  // Set global data
  // Note: This does not have to be stored globally. Perhaps it should be stored locally.
  window.RuffleRedirect = {
    fake_root: fake_root,
    real_root: real_root,
    original_fetch: window.fetch,
  };

  // Create ruffle player
  let ruffle = window.RufflePlayer.newest();
  let player = ruffle.createPlayer();
  document.body.appendChild(player);

  // Replace fetch with a wrapper version that redirects certain requests
  // @TODO Find a way to specify the redirection to requests made from Ruffle only
  window.fetch = wrappedFetch;

  // Load the flash file into Ruffle
  player.load(entry.href);
  
  function tryNewUrl(url: string | null): URL | unknown {
    try { return new URL(url as any); }
    catch (err) { return err; }
  }
}

async function wrappedFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  // Get the requested URL
  let input_url: URL;
  if (input instanceof Request) {
    input_url = new URL(input.url);
  } else {
    input_url = new URL(input + '');
  }

  // Find which URL this request will be redirected from (if any)
  let redirect = false;
  if (
    (input_url.host.toLowerCase() === window.RuffleRedirect!.fake_root.host.toLowerCase()) && 
    (input_url.pathname.toLowerCase().startsWith(window.RuffleRedirect!.fake_root.pathname.toLowerCase()))
  ) { redirect = true; }

  let fake_input: RequestInfo = input;
  let fake_init: RequestInit | undefined = init;

  if (redirect) {
    // Redirect the request
    const fake_input_url = new URL(window.RuffleRedirect!.real_root.href);
    fake_input_url.pathname += input_url.pathname.substr(window.RuffleRedirect!.fake_root.pathname.length);
    fake_input = fake_input_url.href;
    if (input instanceof Request) { fake_init = input; }
  }

  const fetch = window.RuffleRedirect!.original_fetch; // It's illegal to call "fetch" directly from RuffleRedirect for some reason?
  const response = await fetch(fake_input as any, fake_init as any);

  // Note: It is possible to create a new "fake" response and make any modifications you want.
  // const fake_response = new Response(response.body, response);

  return response;
}
