// Ruffle

type RufflePlayer = Node & {
  load: (url: string) => void;
}

type Ruffle = {
  createPlayer: () => RufflePlayer;
}

declare interface Window {
  RufflePlayer: {
    newest: () => Ruffle;
  };
}

// Ruffle Redirect

declare interface Window {
  RuffleRedirect?: {
    fake_root: URL;
    real_root: URL;
    original_fetch: typeof window.fetch,
  };
}
