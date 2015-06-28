require 'faye/websocket'
require 'json'

Faye::WebSocket.load_adapter('thin')

module Suzume
  class Backend

    def initialize(app)
      @app      = app
      @clients  = []
      @channels = []
    end

    def call(env)
      if Faye::WebSocket.websocket?(env)
        # WebSockets logic goes here
        ws = Faye::WebSocket.new(env)

        ws.on :open do |event|
          p [:open, ws.object_id]
          @clients << ws
          ws.send(JSON.dump what: 'rooms', rooms: @channels)
        end

        ws.on :message do |event|
          p [:message, event.data]

          if event.data
            d = JSON.parse event.data

            if d.room
              unless @channels.include? d.room
                @channels.push d.room
              end
            end
          end

          @clients.each {|client| client.send(event.data) }
        end

        ws.on :close do |event|
          p [:close, event.code, event.reason]
          @clients.delete(ws)
          ws = nil
        end

        # Return async Rack response
        ws.rack_response
      else
        @app.call(env)
      end
    end
  end
end
