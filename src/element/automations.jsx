export const initialAutomations = [
    {
         id: 'morning',
         name: 'Buongiorno', 
         description: 'Accende le luci della zona giorno alle 07:00.', 
         active: true
    }, 
    {
        id: 'night', 
        name: 'Buonanotte', 
        description: 'Spegne le luci e abbassa le tapparelle alle 23:00.', 
        active: true
    }, 
    {
        id: 'away', 
        name: 'Modalità fuori casa', 
        description: 'Attiva la sorveglianza quando non c’è nessuno.', 
        active: true
    }, 
    {
        id: 'laundry', 
        name: 'Lavatrice terminata', 
        description: 'Invia una notifica al termine del lavaggio.', 
        active: false
    }, 
    {
        id: 'air', 
        name: 'Ricambio aria', 
        description: 'Apre le tapparelle al mattino.', 
        active: false
    }
];