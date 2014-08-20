module Sinatra
  module API
    module Routes
      module Chatty
        
        def self.registered(app)
        
          app.get '/' do
            erb :"index.html"
          end
        end
        
      end
    end
  end
end