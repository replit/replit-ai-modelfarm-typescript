{ pkgs }: {
  deps = [
    pkgs.htop
    pkgs.killall
    pkgs.jq.bin
    pkgs.nodejs-18_x
  ];
}