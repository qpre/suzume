module Sinatra
  module API
    module Routes
      module Chatty
        
        def self.registered(app)
        
          app.get '/' do
            puts 'delivering index !'
            status 200
            erb :"index.html"
          end
        end
        
      end
    end
  end
end