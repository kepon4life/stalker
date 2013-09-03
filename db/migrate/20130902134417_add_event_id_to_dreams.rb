class AddEventIdToDreams < ActiveRecord::Migration
  def change
    add_column :dreams, :event_id, :integer
  end
end
