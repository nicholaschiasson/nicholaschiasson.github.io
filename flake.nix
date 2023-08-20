{
  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      devShell = pkgs.mkShell {
        buildInputs = [
          pkgs.coreutils
          pkgs.ffmpeg-full
          pkgs.gitMinimal
          pkgs.gomplate
          pkgs.jaq
          pkgs.just
          pkgs.miniserve
          pkgs.nerdfonts
          pkgs.nodejs_18
          pkgs.nodePackages.eslint
          pkgs.nodePackages.prettier
          pkgs.nodePackages.tailwindcss
          pkgs.nodePackages.typescript-language-server
          pkgs.nodePackages.vscode-langservers-extracted
          pkgs.starship
          pkgs.watchexec
        ];
        shellHook = ''
          source .env
          eval "$(starship init bash)"
        '';
      };
    });
}
