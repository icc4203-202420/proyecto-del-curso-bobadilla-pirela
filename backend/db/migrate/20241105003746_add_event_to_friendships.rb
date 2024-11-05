class AddEventToFriendships < ActiveRecord::Migration[7.1]
  def change
    add_reference :friendships, :event, null: true, foreign_key: true
  end
end
