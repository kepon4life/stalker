class CreateCategoriesEventsJoinTable < ActiveRecord::Migration
  def self.up
    create_table :categories_events, :id => false do |t|
      t.references :category, :event # Pour créer les clés etrangères
    end
    add_index :categories_events, [:category_id, :event_id] # Optionnel
  end
  def self.down
    drop_table :categories_events
  end
end
