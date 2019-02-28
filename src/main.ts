/// <reference types="./stone" />

namespace Server {
  const system = server.registerSystem<IStoneServerSystem<{}>>(0, 0);

  system.initialize = function() {
    this.registerCommand(".help", {
      description: "Print StoneEdit help",
      permission: 1,
      overloads: [
        {
          parameters: [],
          handler() {
            return `Welcome to use StoneEdit script\nAuthor: CodeHz\nVersion: 0.1-alpha.1`;
          }
        }
      ]
    });
    this.registerSoftEnum("Face", ["X", "Y", "Z"]);
    this.registerCommand(".cylinder", {
      description: "Make a cylinder",
      permission: 1,
      overloads: [
        {
          parameters: [
            {
              name: "tileName",
              type: "block"
            },
            {
              name: "face",
              type: "soft-enum",
              enum: "Face"
            },
            {
              name: "center",
              type: "position"
            },
            {
              name: "radius",
              type: "int"
            },
            {
              name: "height",
              type: "int",
              optional: true
            }
          ],
          handler(
            block,
            face,
            center: [number, number, number],
            radius,
            height
          ) {
            if (radius < 1) return `Empty`;
            let F: (i: number, j: number, k: number) => [number, number, number] | null;
            const xcenter = center.map(Math.floor) as [number, number, number];
            if (face == "X") {
              F = (i, j, k) => {
                const [x, y, z] = xcenter;
                return [x + k, y + i, z + j];
              };
            } else if (face == "Y") {
              F = (i, j, k) => {
                const [x, y, z] = xcenter;
                return [x + i, y + k, z + j];
              };
            } else if (face == "Z") {
              F = (i, j, k) => {
                const [x, y, z] = xcenter;
                return [x + i, y + j, z + k];
              };
            } else throw "???";
            const result: ([number, number, number] | null)[] = [];
            result.push([0, -radius, radius]);
            for (let p = 1; p <= radius; p++) {
              const t = Math.sqrt(radius ** 2 - p ** 2);
              result.push([p, -t, t]);
              result.push([-p, -t, t]);
            }
            const filtered = result.filter(x => x != null);
            const blname = block.value.name.split(":")[1];
            filtered.forEach(([i, j1, j2]) => {
              const a0 = F(i, j1, 0);
              const a1 = F(i, j2, height);
              const pos = [...a0, ...a1].join(" ");
              this.invokeCommand(`/fill ${pos} ${blname} 0 replace`);
            });
            return filtered.length + " commands invoked";
          }
        }
      ]
    });
  };
}
