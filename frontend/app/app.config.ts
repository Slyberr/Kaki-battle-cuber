export default defineAppConfig({
  ui: {
   table: {
        slots : {
            td: 'border-r border-b text-center',
            th:'text-center whitespace-pre-line'
            
        },
        variants : {
            sticky : {
                true : {
                    thead : 'bg-gray-900'
                }
            }
        }
   },
   tooltip : {
    slots : {
        content : 'h-20 justify-center text-sm'
    }
   }
  },
});
