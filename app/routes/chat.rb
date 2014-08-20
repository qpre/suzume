module Sinatra
  module Server
    module Routes
      module Chat
        
        def self.registered(app)
        
          ['/', '/chat'].each do |path|
            app.get path do
              erb :"index.html"
            end
          end
        end
        
      end
    end
  end
end