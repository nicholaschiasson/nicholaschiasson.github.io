{
  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      devShells.default = pkgs.mkShell {
        buildInputs = [
          pkgs.coreutils
          pkgs.deno
          pkgs.ffmpeg-full
          pkgs.gitMinimal
          pkgs.gomplate
          pkgs.jaq
          pkgs.just
          pkgs.lldb_17
          pkgs.miniserve
          pkgs.nodePackages.prettier
          pkgs.nodePackages.tailwindcss
          pkgs.nodePackages.typescript-language-server
          pkgs.nodePackages.vscode-langservers-extracted
          pkgs.rustup
          pkgs.starship
          pkgs.wasm-pack
          pkgs.watchexec
        ];
        shellHook = ''
          source .env
          eval "$(starship init bash)"
        '';
      };

      devShells.ci = pkgs.mkShell {
        buildInputs = [
          pkgs.deno
          pkgs.ffmpeg-full
          pkgs.gomplate
          pkgs.jaq
          pkgs.just
          pkgs.nodePackages.prettier
          pkgs.nodePackages.tailwindcss
          pkgs.rustup
          pkgs.wasm-pack
        ];
      };
    });
}
