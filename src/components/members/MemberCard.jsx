import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Calendar, Eye, Edit2, Trash2, IdCard, BookOpen } from 'lucide-react';

export default function MemberCard({ member, onEdit, onDelete }) {
  const isActive = member.status === 'Active';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all duration-200 p-5 flex flex-col justify-between group">
      
      {/* Top Section: Avatar, Name, Status, Membership ID */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={member.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`}
                alt={member.name}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/20 bg-slate-50 shrink-0"
                onError={(e) => {
                  e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`;
                }}
              />
              <span
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  isActive ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                title={member.status}
              ></span>
            </div>
            <div>
              <Link
                to={`/members/${member.id}`}
                className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm sm:text-base line-clamp-1"
              >
                {member.name}
              </Link>
              <p className="text-xs text-slate-500 font-medium">{member.role}</p>
            </div>
          </div>

          <span
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
              isActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {member.status}
          </span>
        </div>

        {/* Membership ID Pill */}
        <div className="flex items-center gap-2 mb-3.5 pt-1">
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-100">
            <IdCard className="w-3.5 h-3.5 text-indigo-500" />
            {member.membershipId}
          </span>
          {member.borrowedCount !== undefined && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
              <BookOpen className="w-3 h-3 text-slate-500" />
              {member.borrowedCount} loans
            </span>
          )}
        </div>

        {/* Contact Metadata List */}
        <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2 truncate" title={member.email}>
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{member.email}</span>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-mono text-slate-700">{member.phone}</span>
          </div>

          <div className="flex items-start gap-2 text-slate-500 line-clamp-1" title={member.address}>
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="truncate">{member.address}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px] pt-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Enrolled: {member.membershipDate}</span>
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <Link
          to={`/members/${member.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Profile View</span>
        </Link>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(member)}
            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
            title="Edit Member"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(member)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Member"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
