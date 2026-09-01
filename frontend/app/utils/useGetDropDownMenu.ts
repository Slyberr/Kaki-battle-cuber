import type { DropdownMenuItem } from "@nuxt/ui/runtime/components/DropdownMenu.vue.js";
import type { Socket } from "socket.io-client";
import type { Player } from "~/types/player";

/**
 * Give the dropdownMenu option
 * @param readyHoldingTime 
 * @param inspection 
 * @param inputMode 
 * @param socket 
 * @param roomName 
 * @param me 
 * @returns 
 */
export const useGetDropDownMenu = (
  readyHoldingTime: Ref<Number>,
  inspection: Ref<boolean>,
  inputMode : Ref<"KEYBOARD" | "MANUALLY">,
  socket: Socket,
  roomName: Ref<string>,
  me: Ref<Player>,
): DropdownMenuItem[][] => {
  const menuForEveryone: DropdownMenuItem[][] = [
    [
      {
        label: `Enter le temps (${inputMode.value === 'KEYBOARD' ? 'Au clavier' : 'Manuellement'})` ,
        icon: "lucide:keyboard",
        children: [
          {
            label: "Au Clavier (barre espace)",
            onSelect: () => {
                inputMode.value = "KEYBOARD"
            }
          },
          {
            label: "Manuellement",
            onSelect : () => {
                inputMode.value = "MANUALLY"
            }
          },
        ],
      },
      {
        label: `Presser la barre espace pendant... (${readyHoldingTime.value}s)`,
        icon: "lucide:timer",
        children: [
          {
            label: "0 seconde (déclencher dès la touche pressée)",
            onSelect: () => {
              readyHoldingTime.value = 0;
            },
          },
          {
            label: "0.3 seconde",
            onSelect: () => {
              readyHoldingTime.value = 0.3;
            },
          },
          {
            label: "0.55 seconde (Stackmat)",
            onSelect: () => {
              readyHoldingTime.value = 0.55;
            },
          },
          {
            label: "1 seconde",
            onSelect: () => {
              readyHoldingTime.value = 1;
            },
          },
        ],
      },
      {
        label: `Activer/Désactiver l'inspection (${inspection.value ? "Activée" : "Désactivée"})`,
        icon: "lucide:timer-off",
        onSelect: () => {
          inspection.value = !inspection.value;
        },
      },
    ],
  ];
  if (me.value.owner) {
    menuForEveryone.push([
      {
        label: "Changer d'épreuve",
        icon: "lucide:puzzle",

        children: [
          [
            {
              label: "La session sera réinitialisée.",
            },
            {
              label: "2x2",
              onSelect: () => {
                socket.emit("update-event", "222", roomName.value);
              },
            },
            {
              label: "3x3",
              onSelect: () => {
                socket.emit("update-event", "333", roomName.value);
              },
            },
            {
              label: "3x3oh",
              onSelect: () => {
                socket.emit("update-event", "333oh", roomName.value);
              },
            },
            {
              label: "3x3bf",
              onSelect: () => {
                socket.emit("update-event", "333bf", roomName.value);
              },
            },
            {
              label: "4x4",
              onSelect: () => {
                socket.emit("update-event", "444", roomName.value);
              },
            },
            {
              label: "4x4bf",
              onSelect: () => {
                socket.emit("update-event", "444bf", roomName.value);
              },
            },
            {
              label: "5x5",
              onSelect: () => {
                socket.emit("update-event", "555", roomName.value);
              },
            },
            {
              label: "5x5bf",
              onSelect: () => {
                socket.emit("update-event", "555bf", roomName.value);
              },
            },
            {
              label: "6x6",
              onSelect: () => {
                socket.emit("update-event", "666", roomName.value);
              },
            },
            {
              label: "7x7",
              onSelect: () => {
                socket.emit("update-event", "777", roomName.value);
              },
            },
            {
              label: "Pyraminx",
              onSelect: () => {
                socket.emit("update-event", "pyram", roomName.value);
              },
            },
            {
              label: "Skewb",
              onSelect: () => {
                socket.emit("update-event", "skewb", roomName.value);
              },
            },
            {
              label: "Square-1",
              onSelect: () => {
                socket.emit("update-event", "sq1", roomName.value);
              },
            },
            {
              label: "Clock",
              onSelect: () => {
                socket.emit("update-event", "clock", roomName.value);
              },
            },
            {
              label: "Megaminx",
              onSelect: () => {
                socket.emit("update-event", "minx", roomName.value);
              },
            },
            {
              label: "FTO",
              onSelect: () => {
                socket.emit("update-event", "fto", roomName.value);
              },
            },
          ],
        ],
      },
      {
        label: "Réinitialiser la session",
        icon: "lucide:brush-cleaning",
        onSelect: () => {
          socket.emit("clear-session", roomName.value);
        },
      },
    ]);
  }
  return menuForEveryone;
};
