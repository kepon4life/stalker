class AddTokenToDreams < ActiveRecord::Migration
  	def self.up
    	add_column :dreams, :token, :string
  	end

 	def self.down
   		remove_column :dreams, :token
 	end
end
