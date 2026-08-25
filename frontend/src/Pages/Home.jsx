import React, { useState ,useEffect} from "react";
import axios from "axios";
import {Search,SearchX,Bell,BellOff,MessageSquare,Plus,Send,Menu,X,Phone,Video,Info,} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useUser } from "../Context/userContext";
import { io } from "socket.io-client";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

const SearchAvatar = ({ user, getInitials }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

 useEffect(() => {
    setImageLoaded(false);
  }, [user?.profileImageUrl]);

  if (!user?.profileImageUrl) {
    return (
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-600 shrink-0">
        {getInitials(user?.fullName)}
      </div>
    );
  }

  return (
    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100 shrink-0">
      {!imageLoaded && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse" />
      )}

      <img
        src={user.profileImageUrl}
        alt={user.fullName}
        loading="lazy"
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageLoaded(false)}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};



const Home = () => {
  const {user}=useUser();
  console.log(user);
  const[notificationOpen,setNotificationOpen]=useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState("");

const [search, setSearch] = useState("");
const [searchResults, setSearchResults] = useState([]);
const [searchLoading, setSearchLoading] = useState(false);
const [searchOpen, setSearchOpen] = useState(false);

const [notifications, setNotifications] = useState([]);
const [unreadCount, setUnreadCount] = useState(0);


const navigate=useNavigate();

 const getInitials = (fullName) => {
  if (!fullName) return "";

  return fullName
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((name) => name[0].toUpperCase())
    .join("");
};
const toggleNotification = () => {
  setNotificationOpen((prev) => !prev);
};

const handleSendFriendRequest = async (recipientId) => {
  try {
    const { data } = await api.post(
      `/auth/send-request/${recipientId}`
    );

    toast.success("Friend request sent!");
    

    setSearchResults((prev) =>
      prev.map((u) =>
        u._id === recipientId
          ? {
              ...u,
              friendshipStatus: "pending_sent",
            }
          : u
      )
    );
  } catch (error) {
     toast.error(
      error.response?.data?.message || "Failed to send friend request"
    );
    
  }
};

useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/auth/notifications");
      console.log('nptifcation',data);

      setNotifications(data.notifications);
      

      setUnreadCount(
        data.notifications.filter((notification) => !notification.seen).length
      );
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  if (user?._id) {
    fetchNotifications();
  }
}, [user]);

useEffect(() => {
  if (!user?._id) return;

  const socket = io("http://localhost:3000");

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);

    socket.emit("register", user._id);
  });

  socket.on("friend_request", (notification) => {
    console.log("New notification:", notification);

    setNotifications((prev) => [
      notification,
      ...prev,
    ]);

    setUnreadCount((prev) => prev + 1);
  });

  return () => {
    socket.disconnect();
  };
}, [user]);


useEffect(() => {
  if (!search.trim()) {
    setSearchResults([]);
    setSearchOpen(false);
    return;
  }

  const timer = setTimeout(async () => {
    try {
      setSearchLoading(true);

      const { data } = await api.get("/auth/users/search", {
        params: {
          query: search.trim(),
        },
      });

      const usersWithStatus = await Promise.all(
        data.users.map(async (u) => {
          try {
            const { data: statusData } = await api.get(
              `/auth/status/${u._id}`
            );

            return {
              ...u,
              friendshipStatus: statusData.status,
            };
          } catch (error) {
            return {
              ...u,
              friendshipStatus: "none",
            };
          }
        })
      );

      setSearchResults(usersWithStatus);
      setSearchOpen(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, 300);

  return () => clearTimeout(timer);
}, [search]);
  
  const chats = [
    { id: 1, name: "Alice Rai", status: "online", lastMessage: "Hey, are we still meeting?" },
    { id: 2, name: "Bikash Chaudhary", status: "online", lastMessage: "Project files uploaded." },
    { id: 3, name: "Chakra Bam", status: "away", lastMessage: "Check out this link!" },
  ];


  const handleNotificationClick = async (notification) => {
  try {
    if (!notification.seen) {
      await api.put(
        `/auth/notifications/${notification._id}/seen`
      );

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notification._id
            ? { ...item, seen: true }
            : item
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  } catch (error) {
    console.error("Failed to mark notification as seen:", error);
  }
};

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
  
    setMessageInput("");
  };

 

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
      
      <header className="flex items-center justify-between px-4 lg:px-6 h-16 bg-white border-b border-slate-200 z-30 shrink-0">
       
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle Sidebar"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-slate-800 tracking-tight">ChatApp</span>
            
          </div>
        </div>

       
        <div className="hidden md:flex relative w-96">
  <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />

  <input
    type="text"
    placeholder="Search users..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full bg-slate-100 text-slate-800 text-sm rounded-xl pl-9 pr-4 py-2 border border-transparent focus:bg-white focus:border-blue-500 focus:outline-none"
  />

  {searchOpen && (
    <div className="absolute top-12 left-0 w-full bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-80 overflow-y-auto">
      {searchLoading ? (
        <div className="p-4 text-center text-gray-500">
          Searching...
        </div>
      ) : searchResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4">
  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
    <SearchX className="h-7 w-7 text-slate-400" />
  </div>

  <h3 className="mt-4 text-sm font-semibold text-slate-700">
    No users found
  </h3>

  <p className="mt-1 text-center text-xs text-slate-500">
    Try searching with a different name or username.
  </p>
</div>
      ) : (
  searchResults.map((u) => (
  <button
    key={u._id}
    onClick={() => {
      console.log("Selected user:", u);

      setSelectedChat(u);

      setSearch("");
      setSearchOpen(false);
    }}
    className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 transition cursor-pointer"
  >
    <SearchAvatar
      user={u}
      getInitials={getInitials}
    />

   <div className="flex items-center w-full">
  <div className="text-left min-w-0">
    <p className="font-medium text-gray-800 truncate">
      {u.fullName}
    </p>

    <p className="text-[12px] text-gray-500 truncate">
      @{u.username}
    </p>
  </div>

  <button
  onClick={(e) => {
    e.stopPropagation();

    if (u.friendshipStatus === "none") {
      handleSendFriendRequest(u._id);
    }
  }}
  disabled={
    u.friendshipStatus === "pending_sent" ||
    u.friendshipStatus === "pending_received" ||
    u.friendshipStatus === "friends"
  }
  className={`ml-auto px-3 py-1.5 text-sm font-medium rounded-md ${
    u.friendshipStatus === "friends"
      ? "bg-green-100 text-green-700 cursor-default"
      : u.friendshipStatus === "pending_sent"
      ? "bg-gray-100 text-gray-600 cursor-default"
      : u.friendshipStatus === "pending_received"
      ? "bg-blue-100 text-blue-600 cursor-default"
      : "bg-sky-500 text-white hover:bg-sky-600 cursor-pointer"
  }`}
>
  {u.friendshipStatus === "friends"
    ? "Friends"
    : u.friendshipStatus === "pending_sent"
    ? "Requested"
    : u.friendshipStatus === "pending_received"
    ? "Respond"
    : "Add Friend"}
</button>
</div>
  </button>
))
)}
    </div>
  )}
</div>

       
        <div className="flex items-center gap-3">
          <button
  onClick={toggleNotification}
  className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
>
  <Bell className="w-5 h-5" />

  {unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  )}
</button>
          <button onClick={()=>{
            navigate('/profile')
          }} className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer">
           <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm overflow-hidden ">
  {user?.profileImageUrl ? (
    <img
      src={user.profileImageUrl}
      alt={user.fullName}
      className="w-full h-full object-cover"
    />
  ) : (
    getInitials(user?.fullName)
  )}
</div>
            <span className="hidden sm:inline font-medium text-sm text-slate-700">{user ? user.fullName : "................."}</span>
          </button>
        </div>
         
      </header>

{notificationOpen && (
  <div
    onClick={() => setNotificationOpen(false)}
    className="fixed inset-0 z-50 bg-black/30"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed right-4 top-16 w-70 md:w-85 h-fit min-h-85 origin-top-right animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5"
    >

      
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-50 p-2">
            <Bell className="h-5 w-5 text-blue-600" />
          </div>

          <div>
            <h2 className="text-[15px] font-semibold text-gray-900">
              Notifications
            </h2>

            <p className="text-xs text-gray-500">
              Stay updated with your activity
            </p>
          </div>
        </div>

        <button
          onClick={() => setNotificationOpen(false)}
          className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>

      
      <div className="max-h-96 overflow-y-auto">

        {notifications.length === 0 ? (

         
          <div className="flex flex-col items-center justify-center px-8 py-14">
            <div className="rounded-full bg-gray-50 p-5 ring-1 ring-gray-100">
              <BellOff
                className="h-8 w-8 text-gray-300"
                strokeWidth={1.5}
              />
            </div>

            <h3 className="mt-5 text-base font-medium text-gray-800">
              No notifications yet
            </h3>

            <p className="mt-1.5 text-center text-[13px] leading-relaxed text-gray-400">
              You're all caught up!
              <br />
              New activity will show up here.
            </p>
          </div>

        ) : (

          
          notifications.map((notification) => (
            <button
              key={notification._id}
              onClick={() =>
                handleNotificationClick(notification)
              }
              className={`w-full flex items-center gap-3 px-5 py-4 text-left border-b border-gray-100 transition cursor-pointer ${
                notification.seen
                  ? "bg-white hover:bg-gray-50"
                  : "bg-blue-50 hover:bg-blue-100"
              }`}
            >

              
              <SearchAvatar
                user={notification.sender}
                getInitials={getInitials}
              />

              <div className="flex-1 min-w-0">

                <p className="text-sm text-gray-800">
                  <span className="font-semibold">
                    {notification.sender?.fullName}
                  </span>

                  {notification.type === "friend_request" &&
                    " sent you a friend request."}

                  {notification.type === "friend_accept" &&
                    " accepted your friend request."}

                  {notification.type === "message" &&
                    ` ${notification.message}`}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {new Date(
                    notification.createdAt
                  ).toLocaleString()}
                </p>

              </div>

            
              {!notification.seen && (
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0" />
              )}

            </button>
          ))

        )}

      </div>
    </div>
  </div>
)}
    

    
      <div className="flex flex-1 overflow-hidden relative">
        
      
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/20 z-20 lg:hidden backdrop-blur-xs"
          />
        )}

    
        <aside
          className={`absolute lg:relative z-20 inset-y-0 left-0 w-80 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
         
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Chats..."
                className="w-full bg-slate-100 text-slate-800 text-sm rounded-xl pl-9 pr-4 py-2 border border-transparent focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>

         
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => {
                  setSelectedChat(chat);
                  setSidebarOpen(false); 
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                  selectedChat?.id === chat.id
                    ? "bg-blue-50 text-blue-900 font-medium"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-11 h-11 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600">
                    {chat.name[0]}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white ${
                      chat.status === "online" ? "bg-emerald-500" : "bg-amber-400"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="text-sm font-semibold truncate text-slate-900">{chat.name}</h3>
                    <span className="text-xs text-slate-400">12:45 PM</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{chat.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>

          
          <div className="p-4 border-t border-slate-100">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]">
              <Plus className="w-4 h-4" />
              <span>New Chat</span>
            </button>
          </div>
        </aside>

        
        <main className="flex-1 flex flex-col bg-white overflow-hidden">
          {selectedChat ? (
            <>
   
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-white shrink-0">

     
      <div className="flex items-center gap-3 min-w-0">

        
        <SearchAvatar
          user={selectedChat}
          getInitials={getInitials}
        />

       
        <div className="min-w-0">

          <h2 className="text-sm font-semibold text-slate-900 truncate">
            {selectedChat.fullName}
          </h2>

          <p className="text-xs text-slate-500 truncate">
            @{selectedChat.username}
          </p>

          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />

            <span className="text-[11px] text-emerald-600 font-medium">
              online
            </span>
          </div>

        </div>
      </div>


    
      <button
        onClick={() => setSelectedChat(null)}
        className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
        aria-label="Close chat"
      >
        <X size={18} strokeWidth={3} />
      </button>

    </div>


   
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">

      <div className="h-full flex flex-col items-center justify-center text-center">

       
        <SearchAvatar
          user={selectedChat}
          getInitials={getInitials}
        />

       
        <h3 className="mt-4 text-sm font-semibold text-slate-700">
          No messages
        </h3>

        <p className="mt-1 text-xs text-slate-500 max-w-xs">
          Start a conversation with {selectedChat.fullName}
        </p>

      </div>

    </div>


    
    <form
      onSubmit={handleSendMessage}
      className="p-4 bg-white border-t border-slate-200 shrink-0 flex items-center gap-3"
    >

      <input
        type="text"
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        placeholder={`Message ${selectedChat.fullName}...`}
        className="flex-1 bg-slate-100 text-slate-800 text-sm rounded-xl px-4 py-3 border border-transparent focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
      />

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl flex items-center justify-center transition-all shadow-sm cursor-pointer"
      >
        <Send className="w-4 h-4" />
      </button>

    </form>
  </>
          ) : (
          
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-xs">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">Welcome to ChatApp 👋</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Select a conversation from the sidebar to start chatting or create a new chat.
              </p>
            </div>
          )}
        </main>
      </div>

      

      
    </div>
  );
};



export default Home;

