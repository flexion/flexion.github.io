{
  description = "Flexion Labs website — static site for labs.flexion.us";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in {
        devShells.default = pkgs.mkShell {
          name = "flexion-labs-dev";
          packages = with pkgs; [
            bun
            nodejs_22
            gh
            git
          ];
          shellHook = ''
            echo "flexion-labs dev shell — bun $(bun --version), node $(node --version)"
          '';
        };
      });
}
