local missing = {}

for i=1,#KEYS do
	local exists = redis.call("EXISTS", KEYS[i])
	if exists == 1 then
		table.insert(missing, KEYS[i])
	end
end

return missing
