require 'eventmachine'
require 'sinatra/base'
require 'thin'

def run(opts)
  EventMachine.schedule do
    Signal.trap("INT") do
      EventMachine.stop
    end

    Signal.trap("TERM")do
      EventMachine.stop
    end
  end

  # Start the reactor
  EventMachine.run do
    # define some defaults for our app
    server  = 'thin'
    host    = opts[:host]   || '0.0.0.0'
    port    = opts[:port]   || '8181'
    web_app = opts[:app]

    dispatch = Rack::Builder.app do
      map '/' do
        run web_app
      end
    end

    # Start the web server. Note that you are free to run other tasks
    # within your EM instance.
    Rack::Server.start({
      app:    dispatch,
      server: server,
      Host:   host,
      Port:   port
    })
  end
end
