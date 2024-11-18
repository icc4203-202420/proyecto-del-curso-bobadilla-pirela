class CreateFeeds < ActiveRecord::Migration[6.0]
  def change
    create_table :feeds do |t|
      t.references :user, null: false, foreign_key: true
      t.references :beer, null: false, foreign_key: true  # Aquí se agrega la referencia a beer

      t.timestamps
    end
  end
end